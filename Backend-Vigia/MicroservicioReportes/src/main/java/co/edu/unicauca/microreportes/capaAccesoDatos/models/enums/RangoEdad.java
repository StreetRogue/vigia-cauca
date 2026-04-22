package co.edu.unicauca.microreportes.capaAccesoDatos.models.enums;

/**
 * Rangos de edad de 20 en 20 años, según indicación del docente.
 */
public enum RangoEdad {
    DE_0_A_19,
    DE_20_A_39,
    DE_40_A_59,
    DE_60_A_79,
    DE_80_EN_ADELANTE,
    NO_IDENTIFICADO;

    public static RangoEdad fromEdad(Integer edad) {
        if (edad == null)  return NO_IDENTIFICADO;
        if (edad <  20)    return DE_0_A_19;
        if (edad <  40)    return DE_20_A_39;
        if (edad <  60)    return DE_40_A_59;
        if (edad <  80)    return DE_60_A_79;
        return DE_80_EN_ADELANTE;
    }

    public String getEtiqueta() {
        return switch (this) {
            case DE_0_A_19         -> "0 - 19";
            case DE_20_A_39        -> "20 - 39";
            case DE_40_A_59        -> "40 - 59";
            case DE_60_A_79        -> "60 - 79";
            case DE_80_EN_ADELANTE -> "80+";
            case NO_IDENTIFICADO   -> "No identificado";
        };
    }
}
