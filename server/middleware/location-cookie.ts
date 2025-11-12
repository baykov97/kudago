export default defineEventHandler((event) => {
  const query = getQuery(event)
  const loc = typeof query.location === 'string' ? query.location : ''
  if (!loc) return

  // Сохраняем только slug в cookie, стор сам найдёт город по slug
  setCookie(event, 'selected-city', JSON.stringify({ id: 0, name: loc.toUpperCase(), slug: loc }), {
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365
  })
})


