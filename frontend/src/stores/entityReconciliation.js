const entityId = (entityOrId) =>
  typeof entityOrId === 'object' ? entityOrId?.id : entityOrId

const withoutUndefinedValues = (entity = {}) =>
  Object.fromEntries(
    Object.entries(entity).filter(([, value]) => value !== undefined)
  )

export const upsertEntityById = (
  entities,
  entity,
  { mode = 'prepend', merge = true } = {}
) => {
  const id = entityId(entity)

  if (!id) return entities

  const index = entities.findIndex((entry) => entityId(entry) === id)

  if (index === -1) {
    const nextEntity = withoutUndefinedValues(entity)

    return mode === 'append' ? [...entities, nextEntity] : [nextEntity, ...entities]
  }

  const nextEntities = [...entities]
  const nextEntity = withoutUndefinedValues(entity)
  nextEntities[index] = merge ? { ...nextEntities[index], ...nextEntity } : nextEntity

  return nextEntities
}

export const patchEntityById = (entities, id, patch = {}) => {
  if (!id) return entities

  const nextPatch = withoutUndefinedValues(patch)

  return entities.map((entry) =>
    entityId(entry) === id ? { ...entry, ...nextPatch } : entry
  )
}

export const removeEntityById = (entities, entityOrId) => {
  const id = entityId(entityOrId)

  if (!id) return entities

  return entities.filter((entry) => entityId(entry) !== id)
}

export const removeEntitiesWhere = (entities, predicate) => {
  if (typeof predicate !== 'function') return entities

  return entities.filter((entry) => !predicate(entry))
}
