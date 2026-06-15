package com.autoskola.userservice.repository;

import com.autoskola.userservice.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    @Query("SELECT a FROM Announcement a WHERE a.adminOnly = false AND (" +
           "(a.targetUserId IS NULL AND a.title != 'Dobrodošlica') " +
           "OR a.targetUserId = :userId)")
    java.util.List<Announcement> findVisibleForUser(@Param("userId") Long userId);
}