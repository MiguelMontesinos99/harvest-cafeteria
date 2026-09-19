-- Perfiles automáticos y asignación inicial segura de superadmin.
create or replace function public.crear_perfil_harvest()
returns trigger language plpgsql security definer set search_path=public,auth as $$
begin
  insert into public.perfiles(id,email,nombre,rol)
  values(new.id,coalesce(new.email,''),coalesce(new.raw_user_meta_data->>'nombre',''),'cajero')
  on conflict(id) do nothing;
  return new;
end $$;
drop trigger if exists crear_perfil_harvest on auth.users;
create trigger crear_perfil_harvest after insert on auth.users for each row execute function public.crear_perfil_harvest();

create or replace function public.reclamar_superadmin_harvest()
returns boolean language plpgsql security definer set search_path=public as $$
begin
  if exists(select 1 from public.perfiles where rol='superadmin') then
    raise exception 'El superadmin ya fue asignado';
  end if;
  update public.perfiles set rol='superadmin' where id=auth.uid();
  if not found then
    raise exception 'Primero crea e inicia sesión con tu cuenta Harvest';
  end if;
  return true;
end $$;
grant execute on function public.reclamar_superadmin_harvest() to authenticated;
