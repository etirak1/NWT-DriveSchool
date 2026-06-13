package com.autoskola.userservice.repository;

import com.autoskola.userservice.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    @Query("SELECT a FROM Announcement a WHERE " +
           "(a.targetUserId IS NULL AND a.title != 'Dobrodošlica') " +
           "OR a.targetUserId = :userId")
    List<Announcement> findVisibleForUser(@Param("userId") Long userId);
}