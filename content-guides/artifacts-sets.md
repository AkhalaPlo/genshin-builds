# artifacts-sets.json

`artifacts-sets.json` defines ranked artifact set recommendations for one build.

```txt
src/content/<element>/<rarity>/<character>/<build>/artifacts-sets.json
```

## Expected Shape

```json
{
  "artifact_sets": [
    {
      "groups": [
        {
          "items": [
            {
              "name": "emblem-of-severed-fate",
              "pieces": 4,
              "note": {
                "en": "Use if the [[stat:er]] requirement is high."
              }
            }
          ]
        }
      ]
    },
    {
      "groups": [
        {
          "items": [
            {
              "name": "nymphs-dream",
              "pieces": 4
            }
          ]
        },
        {
          "items": [
            {
              "name": "a-day-carved-from-rising-winds",
              "pieces": 4
            }
          ]
        },
        {
          "choose": true,
          "items": [
            {
              "name": "noblesse-oblige",
              "pieces": 2
            },
            {
              "name": "hydro-dmg-set",
              "pieces": 2
            },
            {
              "name": "atk-set",
              "pieces": 2
            },
            {
              "name": "emblem-of-severed-fate",
              "pieces": 2
            }
          ]
        },
        {
          "choices": [
            {
              "items": [
                {
                  "name": "noblesse-oblige",
                  "pieces": 2
                },
                {
                  "name": "cryo-set",
                  "pieces": 2
                }
              ]
            },
            {
              "items": [
                {
                  "name": "atk-set",
                  "pieces": 2
                },
                {
                  "name": "em-set",
                  "pieces": 2
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "conditional": [
    {
      "items": [
        {
          "name": "blizzard-strayer",
          "pieces": 4,
          "note": {
            "en": "Only useful when the enemy can stay Frozen."
          }
        }
      ]
    }
  ],
  "notes": [
    {
      "en": "This ranking assumes the team can maintain the required aura."
    }
  ]
}
```

## Fields

- `artifact_sets`: Ordered ranking entries. The array order controls the
  displayed ranking number.
  - `artifact_sets[].groups`: Rendered lines for that ranking entry.
    - The first group renders on the numbered line.
    - Later groups render as approximate alternatives below the numbered line.
    - `artifact_sets[].groups[].choose`: Optional boolean. Use `true` when this
      group is a choose-two mix.
    - `artifact_sets[].groups[].items`: Artifact set items shown in this group.
      Required unless the group uses `choices`.
      - `artifact_sets[].groups[].items[].name`: Artifact set ID or alias from
        `src/i18n/<lang>/artifact-sets.json`, or a stat pseudo-set ID from
        `src/i18n/<lang>/stats.json`, such as `atk-set` or `em-set`.
      - `artifact_sets[].groups[].items[].pieces`: Number of set pieces,
        usually `2` or `4`.
      - `artifact_sets[].groups[].items[].note`: Optional localized editorial
        note. Adds a `*` marker beside the item and renders in the artifact
        notes section.
    - `artifact_sets[].groups[].choices`: Optional array of choose-one item
      pools. Use this for 2p/2p combinations where the player should choose one
      item from each pool, such as one DMG set and one ATK/EM set.
      - `artifact_sets[].groups[].choices[].items`: Artifact set items shown in
        that choose-one pool.
      - Choice items use the same `name`, `pieces`, and `note` fields as normal
        group items.
- `conditional`: Optional unranked artifact set groups shown below the ranking
  under `Conditional (See Notes):`.
  - `conditional[].choose`: Optional boolean. Works the same way as
    `artifact_sets[].groups[].choose`.
  - `conditional[].items`: Artifact set items shown in this conditional group.
    - `conditional[].items[].name`: Artifact set ID, artifact set alias, or
      stat pseudo-set ID.
    - `conditional[].items[].pieces`: Number of set pieces, usually `2` or `4`.
    - `conditional[].items[].note`: Optional localized editorial note.
- `notes`: Optional top-level section notes shown under
  `Regarding Artifacts Choices:` without adding a `*` marker to any item.

## Group Rules

Every ranked artifact entry must use `groups`.

### Single Entry

Use one group for a simple ranked set.

```json
{
  "groups": [
    {
      "items": [{ "name": "noblesse-oblige", "pieces": 4 }]
    }
  ]
}
```

This renders as:

```txt
1. Noblesse Oblige (4)
```

### Alternative Entry

Use multiple groups when different options are close enough to share the same
ranking position.

The first group renders on the numbered line. Each extra group renders below it
as an approximate alternative with `≈`.

```json
{
  "groups": [
    {
      "items": [{ "name": "nymphs-dream", "pieces": 4 }]
    },
    {
      "items": [{ "name": "a-day-carved-from-rising-winds", "pieces": 4 }]
    }
  ]
}
```

This renders as:

```txt
2. Nymph's Dream (4)
   ≈ A Day Carved From Rising Winds (4)
```

### Choose Entry

Use `choose: true` when the player should pick two artifact set items from the
same group.

A choose group renders the first item on the main line, the other items as
approximate alternatives, then a `Choose Two` label.

```json
{
  "groups": [
    {
      "choose": true,
      "items": [
        { "name": "noblesse-oblige", "pieces": 2 },
        { "name": "hydro-dmg-set", "pieces": 2 },
        { "name": "atk-set", "pieces": 2 },
        { "name": "emblem-of-severed-fate", "pieces": 2 }
      ]
    }
  ]
}
```

This renders as:

```txt
3. Noblesse Oblige (2)
   Hydro DMG Bonus (2)
   ATK (2)
   Emblem of Severed Fate (2)
   Choose Two
```

### Choose-One Pools

Use `choices` when the player should choose one item from each pool. This is
for recommendations such as:

```txt
Noblesse Oblige (2) / Cryo DMG Bonus (2) [Choose One] and
ATK (2) / EM (2) [Choose One]
```

```json
{
  "groups": [
    {
      "choices": [
        {
          "items": [
            { "name": "noblesse-oblige", "pieces": 2 },
            { "name": "cryo-set", "pieces": 2 }
          ]
        },
        {
          "items": [
            { "name": "atk-set", "pieces": 2 },
            { "name": "em-set", "pieces": 2 }
          ]
        }
      ]
    }
  ]
}
```

This renders as:

```txt
3. Noblesse Oblige (2) / Cryo DMG Bonus (2) [Choose One]
   + ATK (2) / EM (2) [Choose One]
```

Do not put `items` or `choose` directly on an `artifact_sets[]` entry.
They must be inside `artifact_sets[].groups[]`.

## Conditional Sets

Use `conditional` for artifact sets that are only recommended under special
conditions explained in notes. Unlike `artifact_sets`, conditional entries are
group objects directly and do not use a `groups` wrapper:

```json
{
  "conditional": [
    {
      "items": [
        {
          "name": "blizzard-strayer",
          "pieces": 4,
          "note": {
            "en": "Only valuable when enemies can stay Frozen."
          }
        }
      ]
    }
  ]
}
```

## Notes

- Notes support Markdown, inline translation tokens, and rotation notation
  popovers such as `{rot:N2C}`.
- Adding `note` to an item automatically adds a `*` marker next to that item in
  the artifact set list.
- The same `note` also automatically creates a matching note entry under
  `Regarding Artifacts Choices:`.
- Artifact set names are translated before rendering.
- Artifact set names first look in `artifact-sets.json`. If no artifact set
  translation exists, the site looks in `stats.json` so pseudo-set labels like
  `atk-set` can be used.
- Artifact set aliases from `src/data/translation-aliases.json` can be used in
  `name`, such as `"vv"` for `"viridescent-venerer"`.
- Non-`choose` groups with multiple items render on one line separated by `/`.
- `choose: true` groups render the first item on the main line, the remaining
  items as approximate alternatives, and a `Choose Two` label below them.
- `choices` groups render each item pool on its own line with a `Choose One`
  label. Use them instead of a flat `items` array when separate pools must be
  chosen independently.

Example with the same note translated in different languages:

```json
{
  "name": "emblem-of-severed-fate",
  "pieces": 4,
  "note": {
    "en": "Use if the [[stat:er]] requirement is high.",
    "fr": "A utiliser si le besoin en [[stat:er]] est élevé."
  }
}
```
