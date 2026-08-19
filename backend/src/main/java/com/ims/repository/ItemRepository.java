package com.ims.repository;

import com.ims.model.Item;
import com.ims.model.TrialStakeholder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    boolean existsByName(String name);

    /**
     * Main filtered search.
     * - IPR filter joins IPRDetail and checks the exact boolean flag.
     * - Trials filter joins TrialStakeholder and checks stakeholder-level status
     * directly
     * (avoids item.trialsStatus derivation-sync issues entirely).
     */
    @Query("""
            SELECT DISTINCT i FROM Item i
            LEFT JOIN IPRDetail iprD ON iprD.item = i
            LEFT JOIN TrialStakeholder ts ON ts.item = i
            LEFT JOIN ts.feedbacks tf
            WHERE
                (:ownerId          IS NULL OR i.createdBy.id        = :ownerId)
            AND (:search           IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%',:search,'%')))
            AND (:category         IS NULL OR i.category          = :category)
            AND (:devStatus        IS NULL OR i.developmentStatus = :devStatus)
            AND (:totStatus        IS NULL OR i.totStatus         = :totStatus)
            AND (
                :iprDetailFilter IS NULL
                OR (:iprDetailFilter = 'patentFiled'      AND iprD.patentFiled     = true)
                OR (:iprDetailFilter = 'patentGranted'    AND iprD.patentGranted   = true)
                OR (:iprDetailFilter = 'trademarkFiled'   AND iprD.trademarkFiled  = true)
                OR (:iprDetailFilter = 'trademarkGranted' AND iprD.trademarkGranted= true)
                OR (:iprDetailFilter = 'designFiled'      AND iprD.designFiled     = true)
                OR (:iprDetailFilter = 'designGranted'    AND iprD.designGranted   = true)
            )
            AND (
                :trialsFilter IS NULL
                OR tf.status = :trialsFilter
            )
            """)
    Page<Item> findAllWithFilters(
            @Param("ownerId") Long ownerId,
            @Param("search") String search,
            @Param("category") String category,
            @Param("devStatus") Item.DevelopmentStatus devStatus,
            @Param("totStatus") Item.ToTStatus totStatus,
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

    @Query("""
            SELECT COUNT(i) FROM Item i
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId)
            AND i.iprStatus IN :statuses
            """)
    long countByOwnerAndIprStatusIn(
            @Param("ownerId") Long ownerId,
            @Param("statuses") List<Item.IPRStatus> statuses);

    @Query("""
            SELECT COUNT(i) FROM Item i
            WHERE (:ownerId IS NULL OR i.createdBy.id = :ownerId)
            AND i.totStatus IN :statuses
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