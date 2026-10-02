-- Bowl n Sticks - migration 009: top dishes
-- Supabase SQL Editor · Name: "009 - top dishes"
-- Description: Adds top_dishes and item_views to analytics_summary, so the
-- dashboard can answer "which dishes do people actually look at". Mirrored
-- into schema.sql.

create or replace function analytics_summary (p_cafe_slug text, p_days int default 30) returns json language sql security invoker stable
set
  search_path = public as $$
  with scoped as (
    select e.*, (e.created_at at time zone 'Asia/Kolkata') as local_at
    from analytics_event e
    join cafe c on c.id = e.cafe_id
    where c.slug = p_cafe_slug
      and e.created_at >= now() - make_interval(days => p_days)
  ),
  days as (
    select generate_series(
      (now() at time zone 'Asia/Kolkata')::date - (p_days - 1),
      (now() at time zone 'Asia/Kolkata')::date,
      interval '1 day'
    )::date as d
  )
  select json_build_object(
    'days', p_days,
    'menu_opens', (select count(*) from scoped where type = 'menu_open'),
    'section_views', (select count(*) from scoped where type = 'section_view'),
    'item_views', (select count(*) from scoped where type = 'item_view'),
    'by_date', coalesce((
      select json_agg(t order by t.d) from (
        select days.d, count(s.id) filter (where s.type = 'menu_open') as views
        from days left join scoped s on s.local_at::date = days.d
        group by days.d
      ) t
    ), '[]'::json),
    'by_table', coalesce((
      select json_agg(t) from (
        select coalesce(table_code, 'No table') as table_code, count(*) as views
        from scoped where type = 'menu_open'
        group by 1 order by views desc
      ) t
    ), '[]'::json),
    'top_sections', coalesce((
      select json_agg(t) from (
        select ms.name, count(*) as views
        from scoped s join menu_section ms on ms.id = s.section_id
        where s.type = 'section_view'
        group by ms.name order by views desc limit 8
      ) t
    ), '[]'::json),
    'top_dishes', coalesce((
      select json_agg(t) from (
        select mi.name, count(*) as views
        from scoped s join menu_item mi on mi.id = s.item_id
        where s.type = 'item_view'
        group by mi.name order by views desc limit 10
      ) t
    ), '[]'::json),
    'by_hour', coalesce((
      select json_agg(t order by t.hour) from (
        select extract(hour from local_at)::int as hour, count(*) as views
        from scoped where type = 'menu_open'
        group by 1
      ) t
    ), '[]'::json),
    'by_day', coalesce((
      select json_agg(t order by t.dow) from (
        select extract(isodow from local_at)::int as dow, count(*) as views
        from scoped where type = 'menu_open'
        group by 1
      ) t
    ), '[]'::json)
  );
$$;
