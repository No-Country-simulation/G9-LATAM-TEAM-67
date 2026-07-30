package com.g9_latam_team_67.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal; // <-- NUEVO IMPORT: necesario para el nuevo tipo de "probabilidad"
import java.time.LocalDateTime;

@Entity
@Table(name = "contenido")
public class Contenido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Lob
    @Column(nullable = false)
    private String texto;

    @Column(nullable = false, length = 100)
    private String categoria;

    // CAMBIO: antes era "Double probabilidad" con @Column(nullable = false).
    // Hibernate mapea Double -> tipo FLOAT en Oracle por defecto, pero tu columna
    // en la migración es NUMBER(5,4). Para que coincidan exactamente:
    // 1) el tipo Java pasa a BigDecimal (mapea de forma nativa a NUMBER en Oracle)
    // 2) se agregan precision=5 y scale=4 para que coincida con NUMBER(5,4)
    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal probabilidad;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private User usuario;

    protected Contenido() {
    }

    // CAMBIO: el parámetro del constructor cambia de Double a BigDecimal
    // para que coincida con el nuevo tipo del campo.
    public Contenido(
            String titulo,
            String texto,
            String categoria,
            BigDecimal probabilidad,
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

    // CAMBIO: el getter ahora retorna BigDecimal en vez de Double.
    public BigDecimal getProbabilidad() {
        return probabilidad;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public User getUsuario() {
        return usuario;
    }
}