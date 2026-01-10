import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  InteractionManager,
  Keyboard,
  Modal,
  Pressable,
  TextInput,
  View
} from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppText from "../components/AppText";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import styles from "../Styles";


const STORAGE_KEY = "imposter_game_state_v1";

type Player = { id: string; name: string };

type PersistedState = {
  selectedCategories: Record<CategoryKey, boolean>;
  players: Player[];
};

const WORDS =require("../../assets/data/words.json");

const CATEGORY_KEYS = ["places", "food", "objects", "sports", "jobs", "countries", "quran_chapters", "football_players", "cartoon", "anime"] as const;

const CATEGORY_AR: Record<(typeof CATEGORY_KEYS)[number], string> = {
  places: "أماكن",
  food: "غذاء",
  objects: "أشياء",
  sports: "رياضات",
  jobs: "وظائف",
  countries: "دول",
  quran_chapters: "سور",
  football_players: "لاعبين كرة",
  cartoon: "رسوم متحركة",
  anime: "أنمي"
};

type ModalMode = "info" | "confirm";

type CategoryKey = (typeof CATEGORY_KEYS)[number];
type RoundState = {
  categoryKey: CategoryKey;
  categoryNameAr: string;
  secretWord: any;
  imposterIndex: number;
  revealed: boolean[];
  currentRevealIndex: number;
  step: "name" | "secret";
};

function randInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}
function sample<T>(arr: T[]) {
  return arr[randInt(arr.length)];
}

export default function GameApp() {
  const [selectedCategories, setSelectedCategories] = useState<Record<CategoryKey, boolean>>({
    places: true,
    food: true,
    objects: true,
    sports: true,
    jobs: true,
    countries: true,
    quran_chapters: true,
    football_players: true,
    cartoon: true,
    anime: true
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [showImposter, setShowImposter] = useState(false);
  const [round, setRound] = useState<RoundState | null>(null);
  const [phase, setPhase] = useState<"setup" | "reveal" | "discussion">("setup");
  const [uiModalOpen, setUiModalOpen] = useState(false);
  const [uiModalMode, setUiModalMode] = useState<ModalMode>("info");
  const [uiModalTitle, setUiModalTitle] = useState("");
  const [danger, setDanger] = useState(false);
  const [uiModalBody, setUiModalBody] = useState("");
  const [uiModalConfirmText, setUiModalConfirmText] = useState("نعم");
  const [uiModalCancelText, setUiModalCancelText] = useState("إلغاء");
  const uiModalOnConfirmRef = React.useRef<null | (() => void)>(null);
  const [playerEditModalOpen, setPlayerEditModalOpen] = useState(false);
  const [editPlayerIndex, setEditPlayerIndex] = useState(-1);
  const [editPlayerName, setEditPlayerName] = useState("");
  const [editPlayerId, setEditPlayerId] = useState<string | null>(null);

  const editInputRef = useRef<TextInput>(null);
  const currentPlayerName =
  round && players?.[round.currentRevealIndex]
    ? players[round.currentRevealIndex].name
    : "";

  const activeCategoryKeys = useMemo(() => {
    return CATEGORY_KEYS.filter((k) => selectedCategories[k]);
  }, [selectedCategories]);

  const focusEditInput = () => {
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        editInputRef.current?.focus();
      }, 120);
    });
  };

const [hydrated, setHydrated] = useState(false);

useEffect(() => {
  (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: PersistedState = JSON.parse(raw);

        if (parsed?.selectedCategories) setSelectedCategories(parsed.selectedCategories);
        if (Array.isArray(parsed?.players)) setPlayers(parsed.players);
      }
    } catch (e) {
      // ignore corrupted storage; start fresh
    } finally {
      setHydrated(true);
    }
  })();
}, []);

useEffect(() => {
  if (!hydrated) return;

  const payload: PersistedState = {
    selectedCategories,
    players,
  };

  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
}, [selectedCategories, players, hydrated]);


  function openPlayerEditMenu(player: Player) {
  setEditPlayerId(player.id);
  setEditPlayerName(player.name);
  setPlayerEditModalOpen(true);
      requestAnimationFrame(() => {
      setTimeout(() => {
        editInputRef.current?.focus();
      }, 100);
    });
}

  const closePlayerEditModal = () => {
    setPlayerEditModalOpen(false);
    setEditPlayerIndex(-1);
    setEditPlayerName("");
    setEditPlayerId(null);
    };

  const handleSavePlayerName = () => {
  if (!editPlayerId || !editPlayerName.trim()) return;

  setPlayers((prev) =>
    prev.map((p) =>
      p.id === editPlayerId
        ? { ...p, name: editPlayerName.trim() }
        : p
    )
  );

  closePlayerEditModal();
};

  const handleDeletePlayer = () => {
  if (!editPlayerId) return;

  setPlayers((prev) => prev.filter((p) => p.id !== editPlayerId));
  closePlayerEditModal();
};


  function toggleCategory(key: CategoryKey) {
    setSelectedCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  }

function addPlayer() {
  const name = newPlayerName.trim();
  if (!name) return;

  setPlayers((prev) => [
    ...prev,
    { id: `${Date.now()}-${Math.random()}`, name },
  ]);

  setNewPlayerName("");
  Keyboard.dismiss();
}


  function requestResetToSetup() {
    showConfirm({
      title: "تأكيد",
      body: "هل تريد فعلاً إنهاء الجولة والرجوع للإعداد؟ سيتم فقدان الجولة الحالية.",
      confirmText: "نعم، إنهاء",
      cancelText: "إلغاء",
      danger: true,
      onConfirm: () => {
        resetToSetup();
      },
    });
  }

    function requestToViewImposter() {
    showConfirm({
      title: "تأكيد",
      body: "هل تريد فعلاً عرض المندس؟",
      confirmText: "نعم، عرض",
      cancelText: "إلغاء",
      danger: false,
      onConfirm: () => {
        setShowImposter(true);
      },
    });
  }

  function closeUiModal() {
    setUiModalOpen(false);
    setUiModalTitle("");
    setUiModalBody("");
    uiModalOnConfirmRef.current = null;
    setUiModalMode("info");
  }

  function showInfo(title: string, body: string) {
    setUiModalMode("info");
    setUiModalTitle(title);
    setUiModalBody(body);
    setUiModalOpen(true);
  }

  function showConfirm(opts: {
    title: string;
    body: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm: () => void;
  }) {
    setUiModalMode("confirm");
    setUiModalTitle(opts.title);
    setUiModalBody(opts.body);
    setDanger(!!opts.danger);
    setUiModalConfirmText(opts.confirmText ?? "نعم");
    setUiModalCancelText(opts.cancelText ?? "إلغاء");
    uiModalOnConfirmRef.current = opts.onConfirm;
    setUiModalOpen(true);
  }

  function validateBeforeStart(): boolean {
    if (players.length < 3) {
      showInfo("سلامات صاحبي", "لازم 3 لاعبين على الأقل.");
      return false;
    }
    if (activeCategoryKeys.length === 0) {
      showInfo("سلامات صاحبي", "اختر فئة واحدة على الأقل.");
      return false;
    }
    for (const k of activeCategoryKeys) {
      const list = WORDS[k];
      if (!list || list.length < 4) {
        showInfo("خطأ", `قائمة كلمات فئة ${CATEGORY_AR[k]} صغيرة جدًا.`);
        return false;
      }
    }
    return true;
  }

  function startNewRound() {
    setShowImposter(false);

    if (!validateBeforeStart()) return;

    const categoryKey = sample(activeCategoryKeys);
    const wordList = WORDS[categoryKey];
    const secretWord = sample(wordList);

    const imposterIndex = randInt(players.length);


    const newRound: RoundState = {
      categoryKey,
      categoryNameAr: CATEGORY_AR[categoryKey],
      secretWord,
      imposterIndex,
      revealed: Array(players.length).fill(false),
      currentRevealIndex: 0,
      step: "name",
    };
    setRound(newRound);
    setPhase("reveal");
  }

  function resetToSetup() {
    setShowImposter(false);
    setRound(null);
    setPhase("setup");
  }

  function showSecretForCurrent() {
    if (!round) return;
    setRound({ ...round, step: "secret" });
  }

  function nextPlayer() {
    if (!round) return;

    const i = round.currentRevealIndex;

    const updated: RoundState = {
      ...round,
      revealed: round.revealed.map((v, idx) => (idx === i ? true : v)),
      step: "name",
    };

    let next = i + 1;
    while (next < players.length && updated.revealed[next]) next++;

    if (next >= players.length) {
      setRound(updated);
      setPhase("discussion");
      return;
    }

    updated.currentRevealIndex = next;

    setRound(updated);
  }
if (hydrated) {
  return (

    <SafeAreaProvider style={styles.safe}>
      <View style={styles.header}>
        <AppText style={styles.h1}>من المندس؟</AppText>
        <AppText style={styles.sub}>اختر الفئات، أضف لاعبين، وابدأ الجولة.</AppText>
      </View>

      {phase === "setup" && (
        <View style={{ flex: 1 }}>
          <DraggableFlatList
            data={players}
            extraData={players.length}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => setPlayers(data)}
            activationDistance={6}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 150 }}
            ListHeaderComponent={
              <>
                <View style={styles.setupHeader}>
                  <AppText style={styles.h2}>1) اختيار الفئات</AppText>
                  <View style={styles.chipsWrap}>
                    {CATEGORY_KEYS.map((k) => (
                      <Pressable
                        key={k}
                        onPress={() => toggleCategory(k)}
                        style={[
                          styles.chip,
                          selectedCategories[k] ? styles.chipOn : styles.chipOff,
                        ]}
                      >
                        <AppText style={styles.chipText}>{CATEGORY_AR[k]}</AppText>
                      </Pressable>
                    ))}
                  </View>

                  <AppText style={styles.h2}>2) اللاعبون</AppText>

                  <View style={styles.row}>
                    <TextInput
                      value={newPlayerName}
                      onChangeText={setNewPlayerName}
                      placeholder="اسم اللاعب"
                      placeholderTextColor="#777"
                      style={[styles.input, { fontFamily: "stc" }]}
                      textAlign="right"
                    />

                    <Pressable onPress={addPlayer} style={{ width: 110 }}>
                      <LinearGradient
                        colors={["#3FAF6C", "#27573eff"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gbtnSmall}
                      >
                        <AppText style={styles.gbtnText}>إضافة</AppText>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </View>
              </>
            }
            renderItem={({ item, drag, isActive }: RenderItemParams<Player>) => (
              <View style={[styles.listItem, isActive && { opacity: 0.85 }]}>
                <Pressable onPressIn={drag} style={styles.dragHandle} hitSlop={10}>
                  <Ionicons name="reorder-three" size={22} color="#9aa3b2" />
                </Pressable>

                <AppText style={styles.listText}>{item.name}</AppText>

                <Pressable onPress={() => openPlayerEditMenu(item)} style={{ width: 90 }}>
                  <LinearGradient colors={["#1F2636", "#0E1320"]} style={styles.gbtnSmall}>
                    <AppText style={styles.gbtnText}>تعديل</AppText>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          />
          <View style={styles.stickyBottomBar}>
            <PrimaryButton title="ابدأ جولة جديدة" onPress={startNewRound} />
          </View>
        </View>
      )}


      {phase === "reveal" && round && (
        <View style={styles.container}>
          <AppText style={styles.h2}>مرحلة الكشف (بالتناوب)</AppText>

          <View style={styles.card}>
            {round.step === "name" && (
              <>
                <AppText style={styles.metaLabel}>الدور على</AppText>
                <AppText style={styles.metaValue}>{currentPlayerName}</AppText>


                <AppText style={styles.note}>
                  سلّم الجوال لهذا اللاعب. اضغط “عرض الكلمة” فقط عندما يكون جاهزًا.
                </AppText>

                <PrimaryButton title="عرض الكلمة" onPress={showSecretForCurrent} />
              <SecondaryButton title="إنهاء الجولة والعودة للإعداد" onPress={requestResetToSetup} />
              </>
              )}
              {round.step === "secret" && (() => {
                const isImposter =
                  round.currentRevealIndex === round.imposterIndex;

                return (
                  <>
                    <AppText style={styles.metaLabel}>اللاعب</AppText>
                    <AppText style={styles.metaValue}>{currentPlayerName}</AppText>

                    <AppText style={styles.metaLabel}>الفئة</AppText>
                    <AppText style={styles.metaValue}>
                      {round.categoryNameAr}
                    </AppText>

                    <AppText style={styles.metaLabel}>الكلمة</AppText>

                    <View
                      style={[
                        styles.wordBox,
                        isImposter && styles.wordBoxImposter,
                      ]}
                    >
                      {isImposter ? (
                        <AppText style={[styles.bigWord, styles.bigWordImposter]}>
                      أنت المندس
                        </AppText>
                      ) : (
                        <AppText style={styles.bigWord}>
                          {round.secretWord}
                        </AppText>
                      )}
                    </View>

                    <AppText style={styles.note}>
                      احفظها ثم اضغط “التالي” وسلم الجوال للي بعدك.
                    </AppText>

                    <PrimaryButton title="التالي" onPress={nextPlayer} />
                    <SecondaryButton
                      title="إنهاء الجولة والعودة للإعداد"
                      onPress={requestResetToSetup}
                    />
                  </>
                );
              })()}
          </View>
        </View>
      )}

      {phase === "discussion" && round && (
        <View style={[styles.container]}>
          <AppText style={styles.discussionHeader}>النقاش والتصويت</AppText>

          <View style={styles.discussionCard}>
            {!showImposter ? (
              <>
                <AppText style={styles.note}>
                  جميع اللاعبين عرفوا أدوارهم. ابدأوا نقاش، وصوتوا من المندسّ.
                </AppText>

                <PrimaryButton
                  title="عرض المندس"
                  onPress={() => requestToViewImposter()}
                />
              </>
            ) : (
              <>
                <AppText style={styles.sectionTitle}>المندس</AppText>

                <View style={styles.imposterRevealBox}>
                  <AppText style={styles.imposterRevealText}>
                    {players?.[round.imposterIndex]?.name ?? ""}
                  </AppText>
                </View>

                <PrimaryButton
                  title="جولة جديدة (نفس اللاعبين والفئات)"
                  onPress={startNewRound}
                />
                <SecondaryButton
                  title="رجوع للإعداد"
                  onPress={resetToSetup}
                />
              </>
            )}
          </View>
        </View>
      )}
      <Modal
        visible={uiModalOpen}
        transparent
        animationType="fade"
        onRequestClose={closeUiModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <AppText style={styles.modalTitle}>{uiModalTitle}</AppText>
            <AppText style={styles.modalText}>{uiModalBody}</AppText>

            {uiModalMode === "info" ? (
              <Pressable onPress={closeUiModal} style={{ width: "100%" }}>
                <LinearGradient
                  colors={["#1F2636", "#0E1320"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gbtn}
                >
                  <AppText style={styles.gbtnTextSecondary}>تمام</AppText>
                </LinearGradient>
              </Pressable>
            ) : (
              <View style={styles.modalRow}>
                <Pressable onPress={closeUiModal} style={{ flex: 1 }}>
                  <LinearGradient
                    colors={["#1F2636", "#0E1320"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gbtn}
                  >
                    <AppText style={styles.gbtnTextSecondary}>{uiModalCancelText}</AppText>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={() => {
                    const fn = uiModalOnConfirmRef.current;
                    closeUiModal();
                    fn?.();
                  }}
                  style={{ flex: 1 }}
                >
                  <LinearGradient
                    colors={danger ? ["#FF3B3B", "#4A0D16"] : ["#3FAF6C", "#1B3A2A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gbtn}
                  >
                    <AppText style={styles.gbtnTextSecondary}>{uiModalConfirmText}</AppText>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
      <Modal
        visible={playerEditModalOpen}
        transparent
        animationType="fade"
        onRequestClose={closePlayerEditModal}
        onShow={focusEditInput}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <AppText style={styles.modalTitle}>تعديل اللاعب</AppText>
            <View style={{ marginTop: 6, }}>
            <TextInput
              ref={editInputRef}
              value={editPlayerName}
              onChangeText={setEditPlayerName}
              placeholder="اسم اللاعب"
              placeholderTextColor="#777"
              style={[styles.input, { fontFamily: "stc" }]}
              textAlign="right"
              autoFocus={false}
              onSubmitEditing={handleSavePlayerName}
              blurOnSubmit={false} 
            />
            </View>
            <View style={styles.modalRow}>
              <Pressable 
                onPress={handleDeletePlayer} 
                style={{ flex: 1, marginLeft: 8 }}
              >
                <LinearGradient
                  colors={["#FF3B3B", "#4A0D16"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gbtn}
                >
                  <AppText style={styles.gbtnTextSecondary}>حذف</AppText>
                </LinearGradient>
              </Pressable>
              <Pressable 
                onPress={handleSavePlayerName} 
                style={{ flex: 1, marginRight: 8 }}
              >
                <LinearGradient
                  colors={["#3FAF6C", "#1B3A2A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gbtn}
                >
                  <AppText style={styles.gbtnTextSecondary}>حفظ</AppText>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
} else {
  return(
      <SafeAreaProvider style={styles.safe}>
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <AppText style={styles.h2}>جاري التحميل…</AppText>
      </View>
    </SafeAreaProvider>
  );
}

}