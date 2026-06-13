package com.autoskola.userservice.repository;

import com.autoskola.userservice.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    // Global (non-admin-only, no specific target) OR targeted to this user
    java.util.List<Announcement> findByAdminOnlyFalseAndTargetUserIdIsNullOrTargetUserId(Long targetUserId);
}