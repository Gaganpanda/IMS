package com.ims.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ims.model.Item;
import com.ims.model.TrialStakeholder;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    boolean existsByName(String name);

    /**
     * Main filtered search.
     * - Development-status filter checks i.developmentStatus directly for
     * single-SKU items, OR an EXISTS against ItemVariant for multi-SKU
     * items — once an item is converted to variants each variant owns its
     * own independent developmentStatus (see ItemVariant#developmentStatus)
     * and the item's own field is left as a stale snapshot from the moment
     * of conversion (see ItemService#convertToVariant), so items whose
     * current development status only lives on a variant were previously
     * invisible to this filter. Same fix shape as the ToT filter below.
     * - IPR filter checks the item's own IPRDetail row (iprD, joined below)
     * OR an EXISTS against every variant's own IPRDetail — an IPR filing
     * recorded while editing a variant lives on that variant's IPRDetail
     * row (IPRDetail#itemVariant), not the item's, so without the EXISTS
     * branch this filter silently hid every item whose only matching IPR
     * flag was set at the variant level.
     * - Trials filter checks stakeholder-level status via an EXISTS subquery
     * against TrialStakeholder, matching stakeholders linked either directly
     * to the item (ts.item) or through one of its variants (tsVariant.item).
     * The itemVariant side MUST be an explicit LEFT JOIN, not a bare
     * `ts.itemVariant.item = i` path expression: JPQL silently compiles an
     * unqualified path navigation like that into an INNER join, which would
     * drop every stakeholder row where itemVariant is null (i.e. every
     * item-linked, non-variant stakeholder) before the OR is even
     * evaluated — that bug is what caused the filter to show only
     * variant-linked items and silently hide everything else.
     * - ToT filter checks i.totStatus directly for single-SKU items, OR an
     * EXISTS against ItemVariant for multi-SKU items — a variant's ToT
     * status is stored on the variant, not on the parent Item (see
     * ItemVariant#totStatus), so items whose only "To Be Filed" / "Filed"
     * status lived on a variant were previously invisible to this filter
     * entirely (i.totStatus stays null for those items).
     * - The "To Be Filed" branch additionally matches a NULL totStatus, via
     * the separate :matchNullAsToBeFiled boolean computed in ItemService
     * (true only when the selected filter is TO_BE_FILED). totStatus has no
     * default value on creation (AddItem/EditItem only write it when the
     * user actually picks one), so an item nobody has filed ToT paperwork
     * for yet sits at NULL, not at the literal TO_BE_FILED constant —
     * that's also the state every dashboard percentage already treats as
     * "not filed" (totFilled counts only the FILED bucket, so NULL falls on
     * the "to be filed" side of that math by construction). Filtering
     * "To Be Filed" for `i.totStatus = :totStatus` only, with no NULL
     * branch, is comparing against a value that was never actually written
     * to those rows — this filter returned zero hits, not "hidden by the
     * variant case", for exactly the same items the dashboard already
     * counts as outstanding.
     * (A fully-qualified enum literal like `com.ims.model.Item.ToTStatus
     * .TO_BE_FILED` reads fine but Hibernate's HQL parser doesn't resolve
     * nested-enum literals that way — it errors at startup with "Could not
     * interpret path expression", failing application boot entirely. A
     * plain boolean parameter sidesteps that and is guaranteed portable.)
     */
    @Query("""
            SELECT DISTINCT i FROM Item i
            LEFT JOIN IPRDetail iprD ON iprD.item = i
            WHERE
                (:ownerId          IS NULL OR i.createdBy.id        = :ownerId)
            AND (:search           IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%',:search,'%')))
            AND (:category         IS NULL OR i.category          = :category)
            AND (
                :devStatus IS NULL
                OR i.developmentStatus = :devStatus
                OR EXISTS (
                    SELECT 1 FROM ItemVariant iv
                    WHERE iv.item = i AND iv.developmentStatus = :devStatus
                )
            )
            AND (
                :totStatus IS NULL
                OR i.totStatus = :totStatus
                OR (:matchNullAsToBeFiled = true AND i.totStatus IS NULL)
                OR EXISTS (
                    SELECT 1 FROM ItemVariant iv
                    WHERE iv.item = i
                    AND (
                        iv.totStatus = :totStatus
                        OR (:matchNullAsToBeFiled = true AND iv.totStatus IS NULL)
                    )
                )
            )
            AND (
                :iprDetailFilter IS NULL
                OR (:iprDetailFilter = 'patentFiled'      AND iprD.patentFiled     = true)
                OR (:iprDetailFilter = 'patentGranted'    AND iprD.patentGranted   = true)
                OR (:iprDetailFilter = 'trademarkFiled'   AND iprD.trademarkFiled  = true)
                OR (:iprDetailFilter = 'trademarkGranted' AND iprD.trademarkGranted= true)
                OR (:iprDetailFilter = 'designFiled'      AND iprD.designFiled     = true)
                OR (:iprDetailFilter = 'designGranted'    AND iprD.designGranted   = true)
                OR (:iprDetailFilter = 'copyrightFiled'   AND iprD.copyrightFiled  = true)
                OR (:iprDetailFilter = 'copyrightGranted' AND iprD.copyrightGranted= true)
                OR (:iprDetailFilter = 'patentFiled'      AND EXISTS (SELECT 1 FROM IPRDetail vIpr WHERE vIpr.itemVariant.item = i AND vIpr.patentFiled      = true))
                OR (:iprDetailFilter = 'patentGranted'    AND EXISTS (SELECT 1 FROM IPRDetail vIpr WHERE vIpr.itemVariant.item = i AND vIpr.patentGranted    = true))
                OR (:iprDetailFilter = 'trademarkFiled'   AND EXISTS (SELECT 1 FROM IPRDetail vIpr WHERE vIpr.itemVariant.item = i AND vIpr.trademarkFiled   = true))
                OR (:iprDetailFilter = 'trademarkGranted' AND EXISTS (SELECT 1 FROM IPRDetail vIpr WHERE vIpr.itemVariant.item = i AND vIpr.trademarkGranted = true))
                OR (:iprDetailFilter = 'designFiled'      AND EXISTS (SELECT 1 FROM IPRDetail vIpr WHERE vIpr.itemVariant.item = i AND vIpr.designFiled      = true))
                OR (:iprDetailFilter = 'designGranted'    AND EXISTS (SELECT 1 FROM IPRDetail vIpr WHERE vIpr.itemVariant.item = i AND vIpr.designGranted    = true))
                OR (:iprDetailFilter = 'copyrightFiled'   AND EXISTS (SELECT 1 FROM IPRDetail vIpr WHERE vIpr.itemVariant.item = i AND vIpr.copyrightFiled   = true))
                OR (:iprDetailFilter = 'copyrightGranted' AND EXISTS (SELECT 1 FROM IPRDetail vIpr WHERE vIpr.itemVariant.item = i AND vIpr.copyrightGranted = true))
            )
            AND (
                :trialsFilter IS NULL
                OR EXISTS (
                    SELECT 1 FROM TrialStakeholder ts
                    LEFT JOIN ts.itemVariant tsVariant
                    WHERE (ts.item = i OR tsVariant.item = i)
                    AND ts.trialStatus = :trialsFilter
                )
            )
            """)
    Page<Item> findAllWithFilters(
            @Param("ownerId") Long ownerId,
            @Param("search") String search,
            @Param("category") String category,
            @Param("devStatus") Item.DevelopmentStatus devStatus,
            @Param("totStatus") Item.ToTStatus totStatus,
            @Param("matchNullAsToBeFiled") boolean matchNullAsToBeFiled,
            @Param("iprDetailFilter") String iprDetailFilter,
            @Param("trialsFilter") TrialStakeholder.Status trialsFilter,
            Pageable pageable);

    /* ── Dashboard counts ── */
    long countByDevelopmentStatus(Item.DevelopmentStatus status);

    long countByTrialsStatus(Item.TrialsStatus status);

    long countByIprStatusIn(List<Item.IPRStatus> statuses);

    long countByTotStatusIn(List<Item.ToTStatus> statuses);

    /* ── Owner-scoped dashboard counts ── */
    @Query("SELECT COUNT(i) FROM Item i WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId)")
    long countByOwner(@Param("ownerId") Long ownerId);

    @Query("""
            SELECT COUNT(i) FROM Item i
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId)
            AND i.developmentStatus = :status
            """)
    long countByOwnerAndDevelopmentStatus(
            @Param("ownerId") Long ownerId,
            @Param("status") Item.DevelopmentStatus status);

    @Query("""
            SELECT COUNT(i) FROM Item i
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId)
            AND i.trialsStatus = :status
            """)
    long countByOwnerAndTrialsStatus(
            @Param("ownerId") Long ownerId,
            @Param("status") Item.TrialsStatus status);

    /**
     * Distinct-item count for the "IPR FILED" dashboard stat. Matches an
     * item whose OWN iprStatus is in the given list, OR that has at least
     * one variant whose iprStatus is — same reasoning as
     * countByOwnerAndTotStatusIn below: a variant's IPR status lives on the
     * variant (ItemVariant#iprStatus), not the parent Item, once the item
     * has been converted to variants, so a plain `i.iprStatus IN :statuses`
     * check alone silently excluded items whose only matching IPR status
     * was recorded at the variant level.
     */
    @Query("""
            SELECT COUNT(DISTINCT i) FROM Item i
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId)
            AND (
                i.iprStatus IN :statuses
                OR EXISTS (
                    SELECT 1 FROM ItemVariant iv
                    WHERE iv.item = i AND iv.iprStatus IN :statuses
                )
            )
            """)
    long countByOwnerAndIprStatusIn(
            @Param("ownerId") Long ownerId,
            @Param("statuses") List<Item.IPRStatus> statuses);

    /**
     * Distinct-item count for the "TOT FILLED" dashboard stat. Matches an
     * item whose OWN totStatus is in the given list, OR that has at least
     * one variant whose totStatus is — same reasoning as the totStatus
     * branch of findAllWithFilters above: a variant's ToT status lives on
     * the variant, not on the parent Item, so a plain `i.totStatus IN
     * :statuses` check alone silently excludes items whose ToT completion
     * is only recorded at the variant level.
     */
    @Query("""
            SELECT COUNT(DISTINCT i) FROM Item i
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId)
            AND (
                i.totStatus IN :statuses
                OR EXISTS (
                    SELECT 1 FROM ItemVariant iv
                    WHERE iv.item = i AND iv.totStatus IN :statuses
                )
            )
            """)
    long countByOwnerAndTotStatusIn(
            @Param("ownerId") Long ownerId,
            @Param("statuses") List<Item.ToTStatus> statuses);

    @Query("""
            SELECT i.trialsStatus, COUNT(i) FROM Item i
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId)
            GROUP BY i.trialsStatus
            """)
    List<Object[]> countGroupByTrialsStatusForOwner(@Param("ownerId") Long ownerId);

    @Query("""
            SELECT i FROM Item i
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId)
              AND i.productDevCompletionDate IS NOT NULL
              AND i.productDevCompletionDate BETWEEN :today AND :future
            ORDER BY i.productDevCompletionDate ASC
            """)
    List<Item> findUpcomingDueDatesForOwner(
            @Param("ownerId") Long ownerId,
            @Param("today") LocalDate today,
            @Param("future") LocalDate future);

    @Query(value = """
            SELECT MONTH(created_at) AS month, COUNT(*) AS cnt
            FROM items
            WHERE YEAR(created_at) = :year
            GROUP BY MONTH(created_at)
            ORDER BY MONTH(created_at)
            """, nativeQuery = true)
    List<Object[]> countByMonthInYear(@Param("year") int year);

    @Query("SELECT i.trialsStatus, COUNT(i) FROM Item i GROUP BY i.trialsStatus")
    List<Object[]> countGroupByTrialsStatus();

    List<Item> findTop10ByOrderByUpdatedAtDesc();

    /**
     * ToT document breakdown — counts how many items have each individual
     * ToT document code (TTD / TNF / TAC / CEC) checked off in
     * item_tot_documents, owner-scoped. Drives the "ToT Status Overview"
     * dashboard chart instead of a single lumped "ToT Document Filed" bar.
     */
    @Query(value = """
            SELECT d.document_code AS code, COUNT(DISTINCT d.item_id) AS cnt
            FROM item_tot_documents d
            JOIN items i ON i.id = d.item_id
            WHERE (:ownerId IS NULL OR i.created_by_id = :ownerId)
            GROUP BY d.document_code
            """, nativeQuery = true)
    List<Object[]> countGroupByTotDocumentCodeForOwner(@Param("ownerId") Long ownerId);
}