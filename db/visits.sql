-- schema of the d1 visit-analytics database (my-site-visits).
-- apply with: CLOUDFLARE_ACCOUNT_ID=<id> wrangler d1 execute my-site-visits --remote --file db/visits.sql
-- times are utc iso 8601 strings.

-- one row per page load. the exit beacon (time, scroll, load) updates the same row.
create table if not exists views (
  view_id text primary key,
  received text not null,
  -- daily salted hash of ip + user agent; counts everyone, cannot link days.
  visitor text,
  -- random first-party id from localStorage; only with consent or outside consent regions.
  visitor_id text,
  consent text,
  is_bot integer not null default 0,
  path text not null,
  title text,
  referrer text,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  country text,
  region text,
  city text,
  continent text,
  timezone text,
  asn integer,
  as_org text,
  browser text,
  browser_version text,
  os text,
  device text,
  user_agent text,
  language text,
  screen text,
  viewport text,
  theme text,
  duration_ms integer,
  scroll integer,
  load_ms integer
);

create index if not exists views_received on views (received);
create index if not exists views_visitor_id on views (visitor_id);

-- actions inside a view: file downloads, outbound clicks, language switches.
create table if not exists events (
  id integer primary key autoincrement,
  view_id text not null,
  received text not null,
  name text not null,
  data text
);

create index if not exists events_view on events (view_id);
create index if not exists events_name on events (name, received);

-- random salt per utc day for the visitor hash. older salts are deleted, so old
-- hashes can never be recomputed from an ip address.
create table if not exists salts (
  day text primary key,
  value text not null
);
