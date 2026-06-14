package com.autoskola.userservice.repository;

import com.autoskola.userservice.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    // Non-admin-only AND (no specific target OR targeted to this user)
    // NOTE: named-method version had wrong operator precedence (AND before OR without parens)
    @Query("SELECT a FROM Announcement a WHERE a.adminOnly = false AND (a.targetUserId IS NULL OR a.targetUserId = :userId)")
    java.util.List<Announcement> findVisibleForUser(@Param("userId") Long userId);
}