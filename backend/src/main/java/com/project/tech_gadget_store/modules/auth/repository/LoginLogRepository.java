package com.project.tech_gadget_store.modules.auth.repository;

import com.project.tech_gadget_store.modules.auth.entity.LoginLog;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;



@Repository
public interface LoginLogRepository extends JpaRepository<LoginLog, String> {

    void deleteByAccountId(String accountId);

    @Query("SELECT l FROM LoginLog l WHERE " +
           "(:cursorTimestamp IS NULL OR l.loginTime < :cursorTimestamp OR " +
           "(l.loginTime = :cursorTimestamp AND l.id < :cursorId)) " +
           "ORDER BY l.loginTime DESC, l.id DESC")
    List<LoginLog> findLoginLogsCursor(
            @Param("cursorTimestamp") LocalDateTime cursorTimestamp,
            @Param("cursorId") String cursorId,
            Pageable pageable);
}
