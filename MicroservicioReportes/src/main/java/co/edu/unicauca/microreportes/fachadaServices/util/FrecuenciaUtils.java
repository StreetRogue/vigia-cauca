package co.edu.unicauca.microreportes.fachadaServices.util;

import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Function;

/**
 * Calcula frecuencia relativa y acumulada sobre cualquier lista ya ordenada.
 *
 * frecuenciaRelativa  = (eventos_item / total_lista) × 100, redondeado a 2 dec.
 * frecuenciaAcumulada = suma corrida de eventos hasta ese ítem (inclusive).
 */
public final class FrecuenciaUtils {

    private FrecuenciaUtils() {}

    public static <T> void calcular(
            List<T> lista,
            Function<T, Long> getEventos,
            BiConsumer<T, Double> setRelativa,
            BiConsumer<T, Long> setAcumulada) {

        long total = lista.stream().mapToLong(getEventos::apply).sum();
        long acumulada = 0;
        for (T item : lista) {
            long eventos = getEventos.apply(item);
            acumulada += eventos;
            setRelativa.accept(item, total > 0
                    ? Math.round((double) eventos / total * 10_000.0) / 100.0
                    : 0.0);
            setAcumulada.accept(item, acumulada);
        }
    }
}
