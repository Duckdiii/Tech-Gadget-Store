package com.project.tech_gadget_store.modules.auth.repository;

import com.project.tech_gadget_store.modules.auth.entity.LoginLog;
import com.project.tech_gadget_store.modules.auth.entity.enums.LoginStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;



@Repository
public interface LoginLogRepository extends JpaRepository<LoginLog, String> {

    void deleteByAccountId(String accountId);

    Optional<LoginLog> findTopByAccountIdAndLoginStatusOrderByLoginTimeDesc(
            String accountId, LoginStatus loginStatus);

    // cursorTimestamp must be cast to timestamp — see SupplyOrderRepository.findSupplyOrdersCursor
    // for why: Postgres can't infer the type of a bare null parameter under "IS NULL".
    @Query("SELECT l FROM LoginLog l WHERE " +
           "(cast(:cursorTimestamp as timestamp) IS NULL OR l.loginTime < :cursorTimestamp OR " +
           "(l.loginTime = :cursorTimestamp AND l.id < :cursorId)) " +
           "ORDER BY l.loginTime DESC, l.id DESC")
    List<LoginLog> findLoginLogsCursor(
            @Param("cursorTimestamp") LocalDateTime cursorTimestamp,
            @Param("cursorId") String cursorId,
            Pageable pageable);
}
