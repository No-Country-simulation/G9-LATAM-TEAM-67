package com.g9_latam_team_67.backend.repository;

import com.g9_latam_team_67.backend.entity.Contenido;
import com.g9_latam_team_67.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContenidoRepository extends JpaRepository<Contenido, Long> {

    List<Contenido> findAllByUsuario(User usuario);
}
