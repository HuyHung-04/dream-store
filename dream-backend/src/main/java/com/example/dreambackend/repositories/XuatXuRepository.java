package com.example.dreambackend.repositories;

import com.example.dreambackend.entities.XuatXu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface XuatXuRepository extends JpaRepository<XuatXu, Integer> {
}
