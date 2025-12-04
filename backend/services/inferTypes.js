const DATE_RE = /^(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})$/;

function isDateLike(val) {
  if (val == null || val === '') return false;
  if (val instanceof Date && !isNaN(val)) return true;
  const s = String(val).trim();
  if (!DATE_RE.test(s)) {
    const d = new Date(s);
    return !isNaN(d);
  }
  const d = new Date(s);
  return !isNaN(d);
}

function isNumericLike(val) {
  if (val == null || val === '') return false;
  if (typeof val === 'number') return isFinite(val);
  const n = Number(String(val).replace(/,/g, ''));
  return !isNaN(n) && isFinite(n);
}

function inferTypes(headers, rows, sampleSize = 200) {
  const fields = headers.map((h, ordinal) => ({
    field_name: h,
    display_name: h,
    ordinal_position: ordinal,
    inferred_type: 'categorical',
    is_nullable: true,
  }));

  const sample = rows.slice(0, sampleSize);
  fields.forEach(f => {
    let nonNull = 0, nums = 0, dates = 0;
    const seen = new Map();
    let min = null, max = null;
    for (const r of sample) {
      const v = r[f.field_name];
      if (v == null || v === '') continue;
      nonNull++;
      const key = String(v);
      seen.set(key, (seen.get(key) || 0) + 1);
      if (isNumericLike(v)) {
        nums++;
        const n = Number(String(v).replace(/,/g, ''));
        if (min == null || n < min) min = n;
        if (max == null || n > max) max = n;
      } else if (isDateLike(v)) {
        dates++;
        const d = new Date(v);
        const t = d.getTime();
        if (min == null || t < min) min = t;
        if (max == null || t > max) max = t;
      }
    }

    const numRatio = nonNull ? nums / nonNull : 0;
    const dateRatio = nonNull ? dates / nonNull : 0;

    if (dateRatio >= 0.6) {
      f.inferred_type = 'temporal';
      f.min_value = min != null ? new Date(min).toISOString() : undefined;
      f.max_value = max != null ? new Date(max).toISOString() : undefined;
    } else if (numRatio >= 0.6) {
      f.inferred_type = 'numerical';
      f.min_value = min != null ? String(min) : undefined;
      f.max_value = max != null ? String(max) : undefined;
    } else {
      f.inferred_type = 'categorical';
    }

    f.distinct_count = seen.size;
    const sorted = Array.from(seen.entries()).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>({ value:k, count:v }));
    f.top_values = sorted;
  });

  return fields;
}

module.exports = { inferTypes };
