package com.byebank.pix.domain.comum;

import java.util.Objects;
import java.util.UUID;

public abstract class EntidadeBase {
    private final UUID id;

    protected EntidadeBase(UUID id){
        this.id = Objects.requireNonNull(id, "O identificador da identidade é obrigatório.");
    }

    public UUID getId(){
        return this.id;
    }

    @Override
    public boolean equals(Object o){
        if(this == o){
            return true;
        }

        if(o == null || getClass() != o.getClass()){
            return false;
        }

        EntidadeBase que = (EntidadeBase) o;
        return Objects.equals(id, que.id);
    }

    @Override
    public int hashCode(){
        return Objects.hash(id);
    }
}
