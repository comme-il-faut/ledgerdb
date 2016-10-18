create table metadata (
    object_type     text not null,
    object_name     text not null,
    checksum        char(32) not null,  -- MD5 in hex

    constraint schema_metadata_pk primary key (object_type, object_name),
    constraint schema_metadata_ck_type
        check (object_type in ('table', 'view', 'function', 'trigger'))
);

alter table metadata owner to ledgerdb;
