package com.g9_latam_team_67.backend.repository;

import com.g9_latam_team_67.backend.entity.Contenido;
import com.g9_latam_team_67.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContenidoRepository extends JpaRepository<Contenido, Long> {
    List<Contenido> findAllByUsuario(User usuario);

    @Query("SELECT DISTINCT p.categoria FROM Contenido p ORDER BY p.categoria")
    List<String> buscarCategorias();

    @Query("SELECT DISTINCT p.categoria FROM Contenido p WHERE p.usuario = :usuario ORDER BY p.categoria")
    List<String> buscarCategoriasPorUsuario(@Param("usuario") User usuario);

    List<Contenido> findByCategoria(String categoria);

    List<Contenido> findByCategoriaAndUsuarioId(String categoria, Long id);
}
