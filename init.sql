-- MySQL 8.0.16+. Grave em UTC os instantes representados por DATETIME(6).
CREATE DATABASE IF NOT EXISTS byebank_db
    DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
USE byebank_db;

CREATE TABLE usuario (
    id CHAR(36) NOT NULL,
    nome_completo VARCHAR(150) NOT NULL,
    tipo_documento VARCHAR(4) NOT NULL,
    documento VARCHAR(14) NOT NULL,
    email VARCHAR(254) NOT NULL,
    telefone VARCHAR(11) NOT NULL,
    senha_hash VARCHAR(255) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    criado_em DATETIME(6) NOT NULL,
    atualizado_em DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_usuario_documento (documento),
    UNIQUE KEY uk_usuario_email (email),
    CONSTRAINT ck_usuario_documento CHECK (
        (tipo_documento = 'CPF' AND documento REGEXP '^[0-9]{11}$')
        OR (tipo_documento = 'CNPJ' AND documento REGEXP '^[0-9]{14}$')
    ),
    CONSTRAINT ck_usuario_telefone CHECK (telefone REGEXP '^[0-9]{10,11}$'),
    CONSTRAINT ck_usuario_email_normalizado CHECK (email = LOWER(email)),
    CONSTRAINT ck_usuario_status CHECK (status IN ('ATIVO', 'ENCERRADO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE conta_bancaria (
    id CHAR(36) NOT NULL,
    usuario_id CHAR(36) NOT NULL,
    agencia VARCHAR(10) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    saldo DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tipo_conta VARCHAR(20) NOT NULL DEFAULT 'CORRENTE',
    limite_diario DECIMAL(15,2) NOT NULL DEFAULT 1000.00,
    notificacao VARCHAR(10) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVA',
    criada_em DATETIME(6) NOT NULL,
    atualizada_em DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_conta_agencia_numero (agencia, numero),
    -- Encerrar o titular preserva seu identificador e as contas vinculadas.
    CONSTRAINT fk_conta_titular FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT ck_conta_agencia CHECK (agencia REGEXP '^[0-9]{1,10}$'),
    -- O cadastro gera seis dígitos. A edição aceita de 1 a 20.
    CONSTRAINT ck_conta_numero CHECK (numero REGEXP '^[0-9]{1,20}$'),
    CONSTRAINT ck_conta_saldo CHECK (saldo >= 0),
    CONSTRAINT ck_conta_limite CHECK (limite_diario >= 0),
    CONSTRAINT ck_conta_tipo CHECK (tipo_conta IN ('CORRENTE', 'POUPANCA')),
    CONSTRAINT ck_conta_notificacao CHECK (notificacao IN ('EMAIL', 'SMS')),
    CONSTRAINT ck_conta_status CHECK (status IN ('ATIVA', 'BLOQUEADA', 'ENCERRADA'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- O titular principal fica em conta_bancaria.usuario_id. Esta tabela vincula os cotitulares.
CREATE TABLE conta_usuario (
    conta_id CHAR(36) NOT NULL,
    usuario_id CHAR(36) NOT NULL,
    permissao VARCHAR(20) NOT NULL DEFAULT 'CONSULTA',
    PRIMARY KEY (conta_id, usuario_id),
    CONSTRAINT fk_cu_conta FOREIGN KEY (conta_id) REFERENCES conta_bancaria (id) ON DELETE RESTRICT,
    CONSTRAINT fk_cu_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT ck_cu_permissao CHECK (permissao IN ('CONSULTA', 'MOVIMENTACAO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE chave_pix (
    id CHAR(36) NOT NULL,
    conta_id CHAR(36) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    valor VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVA',
    criada_em DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_chave_valor (valor),
    CONSTRAINT fk_chave_conta FOREIGN KEY (conta_id) REFERENCES conta_bancaria (id) ON DELETE RESTRICT,
    CONSTRAINT ck_chave_tipo CHECK (tipo IN ('CPF', 'CNPJ', 'EMAIL', 'TELEFONE', 'ALEATORIA')),
    CONSTRAINT ck_chave_status CHECK (status IN ('ATIVA', 'SUSPENSA'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE transferencia_pix (
    id CHAR(36) NOT NULL,
    conta_origem_id CHAR(36) NULL,
    conta_destino_id CHAR(36) NOT NULL,
    -- Cópia da chave usada, preservada se a chave for desvinculada.
    chave_destino_utilizada VARCHAR(255) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONCLUIDA',
    origem_externa TEXT NULL,
    latitude DECIMAL(10,8) NULL,
    longitude DECIMAL(11,8) NULL,
    criada_em DATETIME(6) NOT NULL,
    data_agendamento DATETIME(6) NULL,
    realizada_em DATETIME(6) NULL,
    cancelada_em DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY ix_transf_origem_data (conta_origem_id, realizada_em),
    KEY ix_transf_destino_data (conta_destino_id, realizada_em),
    KEY ix_transf_agendamento (status, data_agendamento),
    CONSTRAINT fk_transf_origem FOREIGN KEY (conta_origem_id) REFERENCES conta_bancaria (id) ON DELETE RESTRICT,
    CONSTRAINT fk_transf_destino FOREIGN KEY (conta_destino_id) REFERENCES conta_bancaria (id) ON DELETE RESTRICT,
    CONSTRAINT ck_transf_valor CHECK (valor > 0),
    CONSTRAINT ck_transf_contas_distintas CHECK (
        conta_origem_id IS NULL OR conta_origem_id <> conta_destino_id
    ),
    CONSTRAINT ck_transf_origem_externa CHECK (
        conta_origem_id IS NOT NULL
        OR (origem_externa IS NOT NULL AND origem_externa REGEXP '[^[:space:]]')
    ),
    CONSTRAINT ck_transf_localizacao CHECK (
        (latitude IS NULL AND longitude IS NULL)
        OR (latitude IS NOT NULL AND longitude IS NOT NULL
            AND latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
    ),
    CONSTRAINT ck_transf_status_datas CHECK (
        ((status = 'FALHOU' OR (status = 'PENDENTE' AND data_agendamento IS NOT NULL))
            AND realizada_em IS NULL AND cancelada_em IS NULL)
        OR (status IN ('CONCLUIDA', 'ESTORNADA') AND realizada_em IS NOT NULL AND cancelada_em IS NULL)
        OR (status = 'CANCELADA' AND realizada_em IS NULL AND cancelada_em IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE estorno_pix (
    id CHAR(36) NOT NULL,
    transferencia_id CHAR(36) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SOLICITADO',
    solicitado_em DATETIME(6) NOT NULL,
    processado_em DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY ix_estorno_transferencia_status (transferencia_id, status),
    CONSTRAINT fk_estorno_transferencia FOREIGN KEY (transferencia_id)
        REFERENCES transferencia_pix (id) ON DELETE RESTRICT,
    CONSTRAINT ck_estorno_valor CHECK (valor > 0),
    CONSTRAINT ck_estorno_status_datas CHECK (
        (status = 'SOLICITADO' AND processado_em IS NULL)
        OR (status IN ('CONCLUIDO', 'REJEITADO') AND processado_em IS NOT NULL
            AND processado_em >= solicitado_em)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE notificacao (
    id CHAR(36) NOT NULL,
    usuario_id CHAR(36) NOT NULL,
    transferencia_id CHAR(36) NULL,
    titulo VARCHAR(150) NOT NULL,
    mensagem VARCHAR(255) NOT NULL,
    canal VARCHAR(10) NOT NULL,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY ix_notificacao_usuario_data (usuario_id, criado_em),
    CONSTRAINT fk_notificacao_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_notificacao_transferencia FOREIGN KEY (transferencia_id)
        REFERENCES transferencia_pix (id) ON DELETE RESTRICT,
    CONSTRAINT ck_notificacao_canal CHECK (canal IN ('APP', 'EMAIL', 'SMS')),
    CONSTRAINT ck_notificacao_lida CHECK (lida IN (FALSE, TRUE))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE contato (
    id CHAR(36) NOT NULL,
    usuario_id CHAR(36) NOT NULL,
    nome VARCHAR(150) NOT NULL,
    chave_pix VARCHAR(255) NOT NULL,
    criado_em DATETIME(6) NOT NULL,
    ultimo_uso_em DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_contato_usuario_chave (usuario_id, chave_pix),
    KEY ix_contato_usuario_ultimo_uso (usuario_id, ultimo_uso_em),
    CONSTRAINT fk_contato_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE log_login (
    id CHAR(36) NOT NULL,
    usuario_id CHAR(36) NOT NULL,
    conta_id CHAR(36) NULL,
    ip VARCHAR(45) NULL,
    dispositivo VARCHAR(255) NULL,
    sucesso BOOLEAN NOT NULL DEFAULT TRUE,
    data_hora DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY ix_login_usuario_data (usuario_id, data_hora),
    CONSTRAINT fk_log_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_log_conta FOREIGN KEY (conta_id) REFERENCES conta_bancaria (id) ON DELETE SET NULL,
    CONSTRAINT ck_log_sucesso CHECK (sucesso IN (FALSE, TRUE))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

DELIMITER $$

-- A leitura com bloqueio serializa o uso da conta com seu encerramento.
CREATE PROCEDURE verificar_conta_pix_aberta(IN id_conta CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin)
BEGIN
    DECLARE status_conta VARCHAR(20);

    IF id_conta IS NOT NULL THEN
        SELECT status INTO status_conta FROM conta_bancaria WHERE id = id_conta FOR SHARE;
        IF status_conta = 'ENCERRADA' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Conta encerrada indisponível para movimentação PIX';
        END IF;
    END IF;
END$$

CREATE PROCEDURE verificar_usuario_ativo(IN id_usuario CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin)
BEGIN
    DECLARE status_usuario VARCHAR(20);

    SELECT status INTO status_usuario FROM usuario WHERE id = id_usuario FOR SHARE;
    IF status_usuario = 'ENCERRADO' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuário encerrado não pode receber novos vínculos com contas';
    END IF;
END$$

CREATE PROCEDURE verificar_novo_cotitular(
    IN id_conta CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
    IN id_usuario CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
)
BEGIN
    DECLARE status_conta VARCHAR(20);

    CALL verificar_usuario_ativo(id_usuario);
    SELECT status INTO status_conta FROM conta_bancaria WHERE id = id_conta FOR SHARE;
    IF status_conta = 'ENCERRADA' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Conta encerrada não pode receber novos cotitulares';
    END IF;
END$$

CREATE TRIGGER trg_conta_validar_cadastro BEFORE INSERT ON conta_bancaria
FOR EACH ROW
BEGIN
    CALL verificar_usuario_ativo(NEW.usuario_id);
END$$

CREATE TRIGGER trg_conta_encerrada BEFORE UPDATE ON conta_bancaria
FOR EACH ROW
BEGIN
    IF OLD.status = 'ENCERRADA' AND NEW.status <> 'ENCERRADA' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Uma conta encerrada não pode mudar de status';
    END IF;
    IF (OLD.status = 'ENCERRADA' OR NEW.status = 'ENCERRADA') AND NEW.saldo <> OLD.saldo THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Não é possível alterar o saldo de uma conta encerrada ou em encerramento';
    END IF;
    IF NEW.usuario_id <> OLD.usuario_id THEN
        CALL verificar_usuario_ativo(NEW.usuario_id);
    END IF;
    IF OLD.status <> 'ENCERRADA' AND NEW.status = 'ENCERRADA' THEN
        UPDATE chave_pix SET status = 'SUSPENSA' WHERE conta_id = OLD.id AND status = 'ATIVA';
    END IF;
END$$

CREATE TRIGGER trg_cotitular_validar_cadastro BEFORE INSERT ON conta_usuario
FOR EACH ROW
BEGIN
    CALL verificar_novo_cotitular(NEW.conta_id, NEW.usuario_id);
END$$

CREATE TRIGGER trg_cotitular_validar_atualizacao BEFORE UPDATE ON conta_usuario
FOR EACH ROW
BEGIN
    IF NEW.conta_id <> OLD.conta_id OR NEW.usuario_id <> OLD.usuario_id THEN
        CALL verificar_novo_cotitular(NEW.conta_id, NEW.usuario_id);
    END IF;
END$$

CREATE TRIGGER trg_chave_pix_validar_cadastro BEFORE INSERT ON chave_pix
FOR EACH ROW
BEGIN
    IF NEW.status = 'ATIVA' THEN
        CALL verificar_conta_pix_aberta(NEW.conta_id);
    END IF;
END$$

CREATE TRIGGER trg_chave_pix_validar_atualizacao BEFORE UPDATE ON chave_pix
FOR EACH ROW
BEGIN
    IF NEW.status = 'ATIVA' THEN
        CALL verificar_conta_pix_aberta(NEW.conta_id);
    END IF;
END$$

CREATE TRIGGER trg_transf_validar_cadastro BEFORE INSERT ON transferencia_pix
FOR EACH ROW
BEGIN
    IF NEW.status IN ('PENDENTE', 'CONCLUIDA') THEN
        CALL verificar_conta_pix_aberta(NEW.conta_origem_id);
        CALL verificar_conta_pix_aberta(NEW.conta_destino_id);
    END IF;
END$$

CREATE TRIGGER trg_transf_validar_atualizacao BEFORE UPDATE ON transferencia_pix
FOR EACH ROW
BEGIN
    IF NEW.status IN ('PENDENTE', 'CONCLUIDA')
        AND (NEW.status <> OLD.status OR NOT (NEW.conta_origem_id <=> OLD.conta_origem_id)
            OR NEW.conta_destino_id <> OLD.conta_destino_id) THEN
        CALL verificar_conta_pix_aberta(NEW.conta_origem_id);
        CALL verificar_conta_pix_aberta(NEW.conta_destino_id);
    END IF;
END$$

DELIMITER ;
