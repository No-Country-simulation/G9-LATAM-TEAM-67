package com.g9_latam_team_67.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "contenido")
public class Contenido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false, length = 10000)
    private String texto;

    @Column(nullable = false, length = 100)
    private String categoria;

    @Column(nullable = false)
    private Double probabilidad;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private User usuario;

    protected Contenido() {
    }

    public Contenido(
            String titulo,
            String texto,
            String categoria,
            Double probabilidad,
            User usuario
    ) {
        this.titulo = titulo;
        this.texto = texto;
        this.categoria = categoria;
        this.probabilidad = probabilidad;
        this.usuario = usuario;
    }

    @PrePersist
    void asignarFecha() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getTexto() {
        return texto;
    }

    public String getCategoria() {
        return categoria;
    }

    public Double getProbabilidad() {
        return probabilidad;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public User getUsuario() {
        return usuario;
    }
}
