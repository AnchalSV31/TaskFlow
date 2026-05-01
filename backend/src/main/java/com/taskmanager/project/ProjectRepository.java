package com.taskmanager.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members m WHERE p.owner.id = :userId OR m.id = :userId")
    List<Project> findAllByMemberOrOwner(@Param("userId") Long userId);

    boolean existsByIdAndMembersId(Long projectId, Long userId);

    boolean existsByIdAndOwnerId(Long projectId, Long ownerId);
}
