package com.ims.repository;

import com.ims.model.Item;
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

    boolean existsByCode(String code);

    /* ── Dynamic filtered search ── */
    @Query("""
        SELECT i FROM Item i
        WHERE
            (:ownerId      IS NULL OR i.createdBy.id        = :ownerId)
        AND (:search       IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%',:search,'%'))
                           OR LOWER(i.code) LIKE LOWER(CONCAT('%',:search,'%')))
        AND (:category     IS NULL OR i.category          = :category)
        AND (:devStatus    IS NULL OR i.developmentStatus = :devStatus)
        AND (:totStatus    IS NULL OR i.totStatus         = :totStatus)
        AND (:iprStatus    IS NULL OR i.iprStatus         = :iprStatus)
        AND (:trialsStatus IS NULL OR i.trialsStatus      = :trialsStatus)
        """)
    Page<Item> findAllWithFilters(
        @Param("ownerId")      Long ownerId,
        @Param("search")       String search,
        @Param("category")     String category,
        @Param("devStatus")    Item.DevelopmentStatus devStatus,
        @Param("totStatus")    Item.ToTStatus totStatus,
        @Param("iprStatus")    Item.IPRStatus iprStatus,
        @Param("trialsStatus") Item.TrialsStatus trialsStatus,
        Pageable pageable
    );

    /* ── Dashboard counts ── */
    long countByDevelopmentStatus(Item.DevelopmentStatus status);

    long countByTrialsStatus(Item.TrialsStatus status);

    long countByIprStatusIn(List<Item.IPRStatus> statuses);

    long countByTotStatusIn(List<Item.ToTStatus> statuses);

    /* ── Owner-scoped dashboard counts (non-admin users only see their own items) ── */
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
          AND i.expectedCompletionDate IS NOT NULL
          AND i.expectedCompletionDate BETWEEN :today AND :future
        ORDER BY i.expectedCompletionDate ASC
        """)
    List<Item> findUpcomingDueDatesForOwner(
        @Param("ownerId") Long ownerId,
        @Param("today")  LocalDate today,
        @Param("future") LocalDate future
    );

    /* ── Upcoming due dates ── */
    @Query("""
        SELECT i FROM Item i
        WHERE i.expectedCompletionDate IS NOT NULL
          AND i.expectedCompletionDate BETWEEN :today AND :future
        ORDER BY i.expectedCompletionDate ASC
        """)
    List<Item> findUpcomingDueDates(
        @Param("today")  LocalDate today,
        @Param("future") LocalDate future
    );

    /* ── Monthly progress: items created per month in a year ── */
    @Query(value = """
        SELECT MONTH(created_at) AS month, COUNT(*) AS cnt
        FROM items
        WHERE YEAR(created_at) = :year
        GROUP BY MONTH(created_at)
        ORDER BY MONTH(created_at)
        """, nativeQuery = true)
    List<Object[]> countByMonthInYear(@Param("year") int year);

    /* ── Trials overview ── */
    @Query("SELECT i.trialsStatus, COUNT(i) FROM Item i GROUP BY i.trialsStatus")
    List<Object[]> countGroupByTrialsStatus();

    /* ── Recent items ── */
    List<Item> findTop10ByOrderByUpdatedAtDesc();
}
