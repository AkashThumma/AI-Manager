package com.autodev.repository;

import com.autodev.entity.AIPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIPostRepository extends JpaRepository<AIPost, Long> {
    List<AIPost> findByUserId(Long userId);
    List<AIPost> findByStatus(String status);
    List<AIPost> findByStatusInOrderByCreatedAtDesc(List<String> statuses);
    long countByStatus(String status);
}
