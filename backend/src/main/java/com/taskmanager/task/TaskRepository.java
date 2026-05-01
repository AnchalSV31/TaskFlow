package com.taskmanager.task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    Page<Task> findByProjectId(Long projectId, Pageable pageable);

    Page<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status, Pageable pageable);

    Page<Task> findByProjectIdAndAssigneeId(Long projectId, Long assigneeId, Pageable pageable);

    Page<Task> findByProjectIdAndPriority(Long projectId, TaskPriority priority, Pageable pageable);

    @Query("SELECT t FROM Task t JOIN FETCH t.project JOIN FETCH t.createdBy LEFT JOIN FETCH t.assignee " +
           "WHERE t.project.id = :projectId " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:assigneeId IS NULL OR t.assignee.id = :assigneeId) " +
           "AND (:priority IS NULL OR t.priority = :priority)")
    Page<Task> findByProjectIdWithFilters(
            @Param("projectId") Long projectId,
            @Param("status") TaskStatus status,
            @Param("assigneeId") Long assigneeId,
            @Param("priority") TaskPriority priority,
            Pageable pageable);

    List<Task> findByAssigneeId(Long assigneeId);

    @Query("SELECT t FROM Task t JOIN FETCH t.project JOIN FETCH t.createdBy LEFT JOIN FETCH t.assignee WHERE t.assignee.id = :userId AND t.status != com.taskmanager.task.TaskStatus.DONE")
    List<Task> findMyActiveTasks(@Param("userId") Long userId);

    @Query("SELECT t FROM Task t WHERE t.assignee.id = :userId AND t.dueDate < :today AND t.status != 'DONE'")
    List<Task> findOverdueTasks(@Param("userId") Long userId, @Param("today") LocalDate today);

    @Query("SELECT t FROM Task t JOIN FETCH t.project JOIN FETCH t.createdBy LEFT JOIN FETCH t.assignee WHERE t.assignee.id = :userId ORDER BY t.updatedAt DESC")
    List<Task> findRecentByUser(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :userId AND t.status = :status")
    long countByAssigneeIdAndStatus(@Param("userId") Long userId, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :userId AND t.dueDate < :today AND t.status != com.taskmanager.task.TaskStatus.DONE")
    long countOverdueByUser(@Param("userId") Long userId, @Param("today") LocalDate today);

    long countByProjectId(Long projectId);

    // Admin-scope queries
    @Query("SELECT t FROM Task t JOIN FETCH t.project JOIN FETCH t.createdBy LEFT JOIN FETCH t.assignee ORDER BY t.updatedAt DESC")
    List<Task> findRecentAllTasks(Pageable pageable);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.status = :status")
    long countByStatus(@Param("status") TaskStatus status);
}
