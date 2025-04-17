package com.volunteer.management.repository;

import com.volunteer.management.entity.User;
import com.volunteer.management.entity.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;


@Repository // Optional annotation when extending JpaRepository
public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {

    // Spring Data JPA automatically provides CRUD methods (save, findById, findAll, deleteById, etc.)

    // Example custom query method (if needed later)
    // Optional<Volunteer> findByEmail(String email);
    Optional<Volunteer>  findByUserId(Long userId);
    Optional<Volunteer> findByUser(User user);

}