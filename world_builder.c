/*
 * ============================================================
 *   🌍  BUILD YOUR OWN WORLD  🌍
 *   A playful text-based world-building game in C
 *   Perfect for C enthusiasts who love to create!
 * ============================================================
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

/* ── Constants ──────────────────────────────────────────── */
#define MAX_NAME     50
#define MAX_FEATURES 20
#define MAX_LOG      50

/* ── Feature types ──────────────────────────────────────── */
typedef enum {
    FOREST = 0,
    MOUNTAIN,
    OCEAN,
    DESERT,
    CITY,
    VOLCANO,
    MAGICAL_FOREST,
    TUNDRA,
    FEATURE_COUNT
} FeatureType;

const char *FEATURE_NAMES[FEATURE_COUNT] = {
    "🌲 Forest",
    "⛰️  Mountain",
    "🌊 Ocean",
    "🏜️  Desert",
    "🏙️  City",
    "🌋 Volcano",
    "✨ Magical Forest",
    "❄️  Tundra"
};

const char *FEATURE_DESCRIPTIONS[FEATURE_COUNT] = {
    "A lush green forest full of ancient trees and hidden creatures.",
    "A towering mountain range that touches the clouds.",
    "A vast, shimmering ocean teeming with sea life.",
    "A golden desert of endless sand dunes and scorching sun.",
    "A bustling city with tall towers and busy streets.",
    "A roaring volcano that lights up the night sky.",
    "An enchanted forest glowing with magical light.",
    "A frozen tundra where snowflakes never melt."
};

/* ── World structure ────────────────────────────────────── */
typedef struct {
    char        name[MAX_NAME];
    char        creator[MAX_NAME];
    int         age;                          /* in years */
    FeatureType features[MAX_FEATURES];
    int         featureCount;
    int         population;
    int         magic;                        /* 0-100 magic level */
    char        log[MAX_LOG][80];
    int         logCount;
} World;

/* ── Utility helpers ────────────────────────────────────── */
static void clearScreen(void) {
    /* Works on most terminals */
#ifdef _WIN32
    system("cls");
#else
    printf("\033[2J\033[H");
#endif
}

static void printLine(void) {
    printf("============================================================\n");
}

static void addLog(World *w, const char *msg) {
    if (w->logCount < MAX_LOG) {
        strncpy(w->log[w->logCount], msg, 79);
        w->log[w->logCount][79] = '\0';
        w->logCount++;
    }
}

static void waitEnter(void) {
    printf("\n  Press ENTER to continue...");
    /* flush any leftover newline then wait */
    int c;
    while ((c = getchar()) != '\n' && c != EOF);
}

/* ── Banner ─────────────────────────────────────────────── */
static void printBanner(void) {
    clearScreen();
    printLine();
    printf("    🌍   W E L C O M E   T O   W O R L D   B U I L D E R   🌍\n");
    printLine();
    printf("  Create mountains, oceans, forests, cities and much more!\n");
    printf("  Your imagination is the only limit. Let's build a world!\n");
    printLine();
}

/* ── Create a new world ─────────────────────────────────── */
static void createWorld(World *w) {
    clearScreen();
    printLine();
    printf("  🌱  CREATE YOUR WORLD\n");
    printLine();

    printf("\n  What will you name your world? ");
    fgets(w->name, MAX_NAME, stdin);
    w->name[strcspn(w->name, "\n")] = '\0';
    if (w->name[0] == '\0') strcpy(w->name, "Unnamed World");

    printf("  What is your name, mighty creator? ");
    fgets(w->creator, MAX_NAME, stdin);
    w->creator[strcspn(w->creator, "\n")] = '\0';
    if (w->creator[0] == '\0') strcpy(w->creator, "Anonymous");

    /* Randomise starting stats */
    srand((unsigned int)time(NULL));
    w->age        = 0;
    w->featureCount = 0;
    w->population = 0;
    w->magic      = rand() % 30 + 10;   /* 10-39 starting magic */
    w->logCount   = 0;

    char logMsg[120];
    snprintf(logMsg, sizeof(logMsg), "World '%s' created by %s.", w->name, w->creator);
    addLog(w, logMsg);

    printf("\n  ✨ A new world '%s' has been born!\n", w->name);
    printf("  🔮 Starting magic level: %d/100\n", w->magic);
    waitEnter();
}

/* ── Add a feature ──────────────────────────────────────── */
static void addFeature(World *w) {
    if (w->featureCount >= MAX_FEATURES) {
        printf("\n  ⚠️  Your world is full! No more features can be added.\n");
        waitEnter();
        return;
    }

    clearScreen();
    printLine();
    printf("  🏗️   ADD A FEATURE TO %s\n", w->name);
    printLine();
    printf("\n  Choose a feature to add:\n\n");

    for (int i = 0; i < FEATURE_COUNT; i++) {
        printf("    [%d] %s\n", i + 1, FEATURE_NAMES[i]);
    }
    printf("\n  Your choice (1-%d): ", FEATURE_COUNT);

    int choice;
    if (scanf("%d", &choice) != 1) {
        while (getchar() != '\n');
        return;
    }
    while (getchar() != '\n');   /* flush newline */

    if (choice < 1 || choice > FEATURE_COUNT) {
        printf("\n  ❌ Invalid choice.\n");
        waitEnter();
        return;
    }

    FeatureType ft = (FeatureType)(choice - 1);
    w->features[w->featureCount++] = ft;

    /* Update world stats based on feature */
    switch (ft) {
        case FOREST:
            w->population += rand() % 200 + 50;
            w->magic      += 5;
            break;
        case MOUNTAIN:
            w->magic += 3;
            break;
        case OCEAN:
            w->population += rand() % 500 + 100;
            w->magic      += 7;
            break;
        case DESERT:
            break;
        case CITY:
            w->population += rand() % 5000 + 1000;
            break;
        case VOLCANO:
            w->magic += 15;
            break;
        case MAGICAL_FOREST:
            w->magic      += 20;
            w->population += rand() % 100 + 10;
            break;
        case TUNDRA:
            w->magic += 4;
            break;
        default:
            break;
    }
    if (w->magic > 100) w->magic = 100;

    char logMsg[80];
    snprintf(logMsg, sizeof(logMsg), "Added %s to the world.", FEATURE_NAMES[ft]);
    addLog(w, logMsg);

    printf("\n  ✅ You added %s!\n", FEATURE_NAMES[ft]);
    printf("  📖 %s\n", FEATURE_DESCRIPTIONS[ft]);
    waitEnter();
}

/* ── Explore the world ──────────────────────────────────── */
static void exploreWorld(const World *w) {
    clearScreen();
    printLine();
    printf("  🗺️   EXPLORING %s\n", w->name);
    printLine();

    if (w->featureCount == 0) {
        printf("\n  Your world is empty. Add some features first!\n");
        waitEnter();
        return;
    }

    /* Pick a random feature to "visit" */
    srand((unsigned int)time(NULL));
    int idx = rand() % w->featureCount;
    FeatureType ft = w->features[idx];

    printf("\n  You venture into the %s...\n\n", FEATURE_NAMES[ft]);
    printf("  📖 %s\n\n", FEATURE_DESCRIPTIONS[ft]);

    /* Random event */
    const char *events[] = {
        "You discover a hidden treasure chest! 💰",
        "A friendly dragon waves hello! 🐉",
        "You find a mysterious ancient ruin. 🏛️",
        "A shooting star crosses the sky! 🌠",
        "You meet a wise old wizard. 🧙",
        "Butterflies dance around you. 🦋",
        "You hear distant music from nowhere. 🎵",
        "A rainbow appears after a light rain. 🌈"
    };
    int numEvents = (int)(sizeof(events) / sizeof(events[0]));
    printf("  🎲 Random Event: %s\n", events[rand() % numEvents]);

    waitEnter();
}

/* ── View world stats ───────────────────────────────────── */
static void viewStats(const World *w) {
    clearScreen();
    printLine();
    printf("  📊  WORLD STATISTICS — %s\n", w->name);
    printLine();

    printf("\n  🌍 World Name   : %s\n", w->name);
    printf("  👑 Creator      : %s\n", w->creator);
    printf("  📅 World Age    : %d year(s)\n", w->age);
    printf("  👥 Population   : %d beings\n", w->population);
    printf("  🔮 Magic Level  : %d/100", w->magic);

    if      (w->magic >= 80) printf("  (Ancient & Mighty!)");
    else if (w->magic >= 50) printf("  (Quite Magical)");
    else if (w->magic >= 20) printf("  (A Touch of Magic)");
    else                     printf("  (Almost Mundane)");
    printf("\n");

    printf("  🗺️  Features     : %d / %d\n\n", w->featureCount, MAX_FEATURES);

    if (w->featureCount > 0) {
        printf("  Lands in your world:\n");
        for (int i = 0; i < w->featureCount; i++) {
            printf("    %d. %s\n", i + 1, FEATURE_NAMES[w->features[i]]);
        }
    } else {
        printf("  (No features yet — go build something!)\n");
    }

    waitEnter();
}

/* ── Pass time ──────────────────────────────────────────── */
static void passTime(World *w) {
    clearScreen();
    printLine();
    printf("  ⏳  TIME PASSES IN %s\n", w->name);
    printLine();

    int years = (rand() % 100) + 1;
    w->age += years;

    /* Population grows naturally */
    if (w->population > 0) {
        int growth = (int)(w->population * 0.1 * ((double)years / 10));
        w->population += growth;
        printf("\n  ⏩ %d year(s) pass...\n", years);
        printf("  📈 Population grew by %d! Now: %d beings.\n", growth, w->population);
    } else {
        printf("\n  ⏩ %d year(s) pass...\n  The world is quiet and empty...\n", years);
    }

    /* Random world event */
    srand((unsigned int)time(NULL) + w->age);
    int event = rand() % 5;
    switch (event) {
        case 0:
            printf("  ⚡ A great storm swept through the land!\n");
            break;
        case 1:
            printf("  🌸 A season of great harvest blessed the people!\n");
            w->population += 50;
            break;
        case 2:
            printf("  🔮 A surge of magic energy filled the air! (+5 magic)\n");
            w->magic = (w->magic + 5 > 100) ? 100 : w->magic + 5;
            break;
        case 3:
            printf("  🌞 Decades of peace and prosperity followed!\n");
            w->population += 200;
            break;
        case 4:
            printf("  🌑 A mysterious eclipse darkened the skies...\n");
            break;
    }

    char logMsg[80];
    snprintf(logMsg, sizeof(logMsg), "%d year(s) passed. World age: %d.", years, w->age);
    addLog(w, logMsg);

    waitEnter();
}

/* ── View history log ───────────────────────────────────── */
static void viewLog(const World *w) {
    clearScreen();
    printLine();
    printf("  📜  WORLD HISTORY — %s\n", w->name);
    printLine();

    if (w->logCount == 0) {
        printf("\n  No history yet.\n");
    } else {
        printf("\n");
        for (int i = 0; i < w->logCount; i++) {
            printf("  [%2d] %s\n", i + 1, w->log[i]);
        }
    }
    waitEnter();
}

/* ── Main menu ──────────────────────────────────────────── */
static int mainMenu(const World *w) {
    clearScreen();
    printLine();
    printf("  🌍  %s  |  Age: %d yrs  |  Pop: %d  |  Magic: %d/100\n",
           w->name, w->age, w->population, w->magic);
    printLine();
    printf("\n  What would you like to do?\n\n");
    printf("    [1] 🏗️   Add a feature to your world\n");
    printf("    [2] 🗺️   Explore your world\n");
    printf("    [3] 📊   View world statistics\n");
    printf("    [4] ⏳   Let time pass\n");
    printf("    [5] 📜   View world history\n");
    printf("    [6] 🚪   Exit\n");
    printf("\n  Your choice: ");

    int choice;
    if (scanf("%d", &choice) != 1) {
        while (getchar() != '\n');
        return 0;
    }
    while (getchar() != '\n');
    return choice;
}

/* ── Entry point ────────────────────────────────────────── */
int main(void) {
    World world;
    memset(&world, 0, sizeof(world));

    printBanner();
    printf("\n  Press ENTER to start building your world...");
    getchar();

    createWorld(&world);

    int running = 1;
    while (running) {
        int choice = mainMenu(&world);
        switch (choice) {
            case 1: addFeature(&world);  break;
            case 2: exploreWorld(&world); break;
            case 3: viewStats(&world);    break;
            case 4: passTime(&world);     break;
            case 5: viewLog(&world);      break;
            case 6:
                clearScreen();
                printLine();
                printf("  👋  Farewell, %s!\n", world.creator);
                printf("  Your world '%s' will live on forever.\n", world.name);
                printf("  Thank you for playing World Builder! 🌍\n");
                printLine();
                running = 0;
                break;
            default:
                printf("\n  ❌ Invalid choice. Try again.\n");
                waitEnter();
        }
    }

    return 0;
}
