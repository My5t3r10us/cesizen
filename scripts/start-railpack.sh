#!/bin/sh
set -eu

case "${RUN_DB_MIGRATIONS:-false}" in
  1|true|TRUE|yes|YES)
    echo "Applying database migrations..."
    bun run db:migrate
    ;;
esac

exec bun run start
