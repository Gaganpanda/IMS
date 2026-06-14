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
            (:search       IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%',:search,'%'))
                           OR LOWER(i.code) LIKE LOWER(CONCAT('%',:search,'%')))
        AND (:category     IS NULL OR i.category          = :category)
        AND (:devStatus    IS NULL OR i.developmentStatus = :devStatus)
        AND (:totStatus    IS NULL OR i.totStatus         = :totStatus)
        AND (:iprStatus    IS NULL OR i.iprStatus         = :iprStatus)
        AND (:trialsStatus IS NULL OR i.trialsStatus      = :trialsStatus)
        """)
    Page<Item> findAllWithFilters(
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
