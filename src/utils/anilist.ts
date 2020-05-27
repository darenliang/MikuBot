export function anilistAnimeSearchQuery(query: string, perPage: number): any {
    return {
        query: `
query ($perPage: Int, $search: String) {
  Page(perPage: $perPage) {
    media(search: $search, type: ANIME) {
      idMal
      title {
        romaji
        english
        native
        userPreferred
      }
      type
      format
      status
      description
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      season
      seasonYear
      episodes
      source
      coverImage {
        extraLarge
        color
      }
      bannerImage
      genres
      averageScore
      studios {
        edges {
          node {
            isAnimationStudio
            name
          }
        }
      }
      siteUrl
    }
  }
}
`,
        variables: {
            search: query,
            perPage: perPage
        }
    };
}

export function anilistMangaSearchQuery(query: string, perPage: number): any {
    return {
        query: `
query ($perPage: Int, $search: String) {
  Page(perPage: $perPage) {
    media(search: $search, type: MANGA) {
      idMal
      title {
        romaji
        english
        native
        userPreferred
      }
      type
      format
      status
      description
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      volumes
      chapters
      source
      coverImage {
        extraLarge
        color
      }
      bannerImage
      staff {
        edges {
          node {
            name {
              full
            }
          }
        }
      }
      genres
      averageScore
      rankings {
        rank
        type
        allTime
      }
      siteUrl
    }
  }
}
`,
        variables: {
            search: query,
            perPage: perPage
        }
    };
}

export function mapFormats(format: string): string {
    const data: any = {
        TV: 'TV',
        TV_SHORT: 'TV Short',
        MOVIE: 'Movie',
        SPECIAL: 'Special',
        OVA: 'OVA',
        ONA: 'ONA',
        MUSIC: 'Music',
        MANGA: 'Manga',
        NOVEL: 'Novel',
        ONE_SHOT: 'One Shot',
        ORIGINAL: 'Original',
        LIGHT_NOVEL: 'Light Novel',
        VISUAL_NOVEL: 'Visual Novel',
        VIDEO_GAME: 'Video Game',
        OTHER: 'Other',
        DOUJINSHI: 'Doujinshi',
        ANIME: 'Anime'
    };
    return data[format] ? data[format] : 'Unknown';
}