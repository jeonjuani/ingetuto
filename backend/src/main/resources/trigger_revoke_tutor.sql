-- Trigger para eliminar materias de tutor y actualizar estado de solicitud cuando se revoca el rol de TUTOR

DELIMITER //

DROP TRIGGER IF EXISTS trg_revoke_tutor_role; //

CREATE TRIGGER trg_revoke_tutor_role
AFTER DELETE ON tbl_rol_x_usuario
FOR EACH ROW
BEGIN
    DECLARE role_name VARCHAR(255);
    
    -- Obtener el nombre del rol que se está eliminando
    SELECT nombre_rol INTO role_name 
    FROM tbl_roles 
    WHERE id_rol = OLD.id_rol;
    
    -- Si el rol eliminado es TUTOR
    IF role_name = 'TUTOR' THEN
        -- 1. Eliminar sus registros en tbl_tutor_x_materia
        DELETE FROM tbl_tutor_x_materia 
        WHERE id_tutor = OLD.id_usuario;

        -- 2. Actualizar el estado de la solicitud a 'REVOCADO' para permitir nueva postulación
        -- Solo actualizamos si estaba en estado 'APROBADO'
        UPDATE tbl_registro_aspirante_tutor 
        SET estado = 'REVOCADO' 
        WHERE id_aspirante = OLD.id_usuario AND estado = 'APROBADO';
    END IF;
END;
//

DELIMITER ;
