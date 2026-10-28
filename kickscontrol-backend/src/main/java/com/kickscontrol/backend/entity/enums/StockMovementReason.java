package com.kickscontrol.backend.entity.enums;

import java.util.Arrays;
import java.util.Optional;

/**
 * Why units come onto or leave the shelf outside a sale. The label is what the shop floor writes
 * (and what the column stores); the sign says which way the units must move: +1 in, -1 out, 0 either.
 */
public enum StockMovementReason {
    RECEPCION("RECEPCIÓN", 1),
    DEVOLUCION("DEVOLUCIÓN", 1),
    AJUSTE("AJUSTE", 0),
    MERMA("MERMA", -1);

    private final String label;
    private final int sign;

    StockMovementReason(String label, int sign) {
        this.label = label;
        this.sign = sign;
    }

    public String getLabel() {
        return label;
    }

    public boolean allows(int delta) {
        return sign == 0 || Integer.signum(delta) == sign;
    }

    public static Optional<StockMovementReason> fromLabel(String label) {
        return Arrays.stream(values()).filter(r -> r.label.equalsIgnoreCase(label)).findFirst();
    }
}
