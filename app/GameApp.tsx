import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Pressable,
  TextInput,
  ScrollView,
  Modal,
  StyleSheet,
  Keyboard 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "@/components/AppText";

const WORDS =require("../assets/data/words.json");

// الفئات المطلوبة في لعبتك (5 فقط كما طلبت)
const CATEGORY_KEYS = ["places", "food", "objects", "sports", "jobs", "countries", "quran_chapters"] as const;

const CATEGORY_AR: Record<(typeof CATEGORY_KEYS)[number], string> = {
  places: "أماكن",
  food: "أكل",
  objects: "أشياء",
  sports: "رياضات",
  jobs: "وظائف",
  countries: "دول",
  quran_chapters: "سور"
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
  });

  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [showImposter, setShowImposter] = useState(false);

  const [round, setRound] = useState<RoundState | null>(null);
  const [phase, setPhase] = useState<"setup" | "reveal" | "discussion">("setup");
  const [uiModalOpen, setUiModalOpen] = useState(false);
  const [uiModalMode, setUiModalMode] = useState<ModalMode>("info");
  const [uiModalTitle, setUiModalTitle] = useState("");
  const [uiModalBody, setUiModalBody] = useState("");
  const [uiModalConfirmText, setUiModalConfirmText] = useState("نعم");
  const [uiModalCancelText, setUiModalCancelText] = useState("إلغاء");
const uiModalOnConfirmRef = React.useRef<null | (() => void)>(null);
  const activeCategoryKeys = useMemo(() => {
    return CATEGORY_KEYS.filter((k) => selectedCategories[k]);
  }, [selectedCategories]);

  function toggleCategory(key: CategoryKey) {
    setSelectedCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  }

function addPlayer() {
  const name = newPlayerName.trim();
  if (!name) return;

  setPlayers((prev) => [...prev, name]);
  setNewPlayerName("");

  Keyboard.dismiss();
}
function requestResetToSetup() {
  showConfirm({
    title: "تأكيد",
    body: "هل تريد فعلاً إنهاء الجولة والرجوع للإعداد؟ سيتم فقدان الجولة الحالية.",
    confirmText: "نعم، إنهاء",
    cancelText: "إلغاء",
    onConfirm: () => {
      resetToSetup();
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
  onConfirm: () => void;
}) {
  setUiModalMode("confirm");
  setUiModalTitle(opts.title);
  setUiModalBody(opts.body);
  setUiModalConfirmText(opts.confirmText ?? "نعم");
  setUiModalCancelText(opts.cancelText ?? "إلغاء");
  uiModalOnConfirmRef.current = opts.onConfirm;
  setUiModalOpen(true);
}
  function removePlayer(idx: number) {
    setPlayers((prev) => prev.filter((_, i) => i !== idx));
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

  // find next unrevealed
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

  // UI Helpers
function PrimaryButton(props: { title: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={props.onPress} disabled={props.disabled} style={{ width: "100%" }}>
      <LinearGradient
        colors={props.disabled ? ["#2C3340", "#2C3340"] : ["#3FAF6C", "#1B3A2A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gbtn, props.disabled && { opacity: 0.55 }]}
      >
        <AppText style={styles.gbtnText}>{props.title}</AppText>
      </LinearGradient>
    </Pressable>
  );
}

function SecondaryButton(props: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={{ width: "100%" }}>
      <LinearGradient
colors={["#1F2636", "#0E1320"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gbtn}
      >
        <AppText style={styles.gbtnTextSecondary}>{props.title}</AppText>
      </LinearGradient>
    </Pressable>
  );
}


  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <AppText style={styles.h1}>من المندس؟</AppText>
        <AppText style={styles.sub}>اختر الفئات، أضف لاعبين، وابدأ الجولة.</AppText>
      </View>

      {phase === "setup" && (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <AppText style={styles.h2}>1) اختيار الفئات</AppText>
          <View style={styles.chipsWrap}>
            {CATEGORY_KEYS.map((k) => (
              <Pressable
                key={k}
                onPress={() => toggleCategory(k)}
                style={[styles.chip, selectedCategories[k] ? styles.chipOn : styles.chipOff]}
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

          <View style={styles.list}>
  {players.map((p, idx) => (
    <View key={`${p}-${idx}`} style={styles.listItem}>
      <AppText style={styles.listText}>{p}</AppText>

      <Pressable onPress={() => removePlayer(idx)} style={{ width: 90 }}>
        <LinearGradient
          colors={["#FF3B3B", "#791129ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gbtnSmall}
        >
          <AppText style={styles.gbtnText}>حذف</AppText>
        </LinearGradient>
      </Pressable>
    </View>
            ))}
          </View>

          <PrimaryButton title="ابدأ جولة جديدة" onPress={startNewRound} />
        </ScrollView>
      )}

      {phase === "reveal" && round && (
  <View style={styles.container}>
    <AppText style={styles.h2}>مرحلة الكشف (بالتناوب)</AppText>

    <View style={styles.card}>
      {/* STEP 1: NAME ONLY */}
      {round.step === "name" && (
  <>
    <AppText style={styles.metaLabel}>الدور على</AppText>
    <AppText style={styles.metaValue}>{players[round.currentRevealIndex]}</AppText>

    <AppText style={styles.note}>
      سلّم الجوال لهذا اللاعب. اضغط “عرض الكلمة” فقط عندما يكون جاهزًا.
    </AppText>

    <PrimaryButton title="عرض الكلمة" onPress={showSecretForCurrent} />
  <SecondaryButton title="إنهاء الجولة والعودة للإعداد" onPress={requestResetToSetup} />
  </>
)}


{/* STEP 2: SHOW CATEGORY + ROLE/WORD */}

{round.step === "secret" && (() => {
  const isImposter =
    round.currentRevealIndex === round.imposterIndex;

  return (
    <>
      <AppText style={styles.metaLabel}>اللاعب</AppText>
      <AppText style={styles.metaValue}>
        {players[round.currentRevealIndex]}
      </AppText>

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
        onPress={resetToSetup}
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
            الآن كل اللاعبين عرفوا أدوارهم. ابدأوا نقاش، وبعدها صوّتوا مين المُندسّ.
          </AppText>

          <PrimaryButton
            title="عرض المندس"
            onPress={() => setShowImposter(true)}
          />
        </>
      ) : (
        <>
          <AppText style={styles.sectionTitle}>المندس</AppText>

          <View style={styles.imposterRevealBox}>
            <AppText style={styles.imposterRevealText}>
              {players[round.imposterIndex]}
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
              colors={["#FF3B3B", "#4A0D16"]}
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




    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#070B14",
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },

  h1: {
    color: "#EAF2FF",
    fontSize: 28,
    textAlign: "right",
    letterSpacing: 0.2,
    marginTop: 24,
  },

  sub: {
    color: "rgba(234,242,255,0.70)",
    marginTop: 6,
    textAlign: "right",
    fontSize: 14,
    lineHeight: 20,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 14,
  },

  h2: {
    color: "#EAF2FF",
    fontSize: 16,
    textAlign: "right",
    marginTop: 6,
  },

  // Chips (stronger)
  chipsWrap: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10,
  },

  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },

  chipOn: {
    backgroundColor: "rgba(124,255,107,0.14)",
    borderColor: "rgba(124,255,107,0.70)",
  },

  chipOff: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.10)",
  },

  chipText: {
    color: "#EAF2FF",
    fontSize: 14,
  },

  // Inputs
  row: {
    flexDirection: "row-reverse",
    gap: 10,
    alignItems: "center",
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(234,242,255,0.12)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#EAF2FF",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  // List
  list: { gap: 10 },

  listItem: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(234,242,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    padding: 14,
  },

  listText: {
    color: "#EAF2FF",
    fontSize: 16,
    textAlign: "right",
  },

  // Gradient buttons
  gbtn: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  gbtnSmall: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  gbtnText: {
    color: "#fff",
    fontSize: 15,
    letterSpacing: 0.2,
    textAlign: "center",
  },

  gbtnTextSecondary: {
    color: "#EAF2FF",
    fontSize: 15,
    letterSpacing: 0.2,
    textAlign: "center",
  },

  // Cards: more contrast
  card: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(234,242,255,0.10)",
    gap: 12,
  },

  // Meta labels
  metaLabel: {
    color: "rgba(234,242,255,0.70)",
    textAlign: "right",
    fontSize: 12,
    letterSpacing: 0.4,
  },

  metaValue: {
    color: "#EAF2FF",
    textAlign: "right",
    fontSize: 16,
  },

  // Word box: chess green vibe
  wordBox: {
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "rgba(63,175,108,0.14)",
    borderColor: "rgba(63,175,108,0.40)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  wordBoxImposter: {
    backgroundColor: "rgba(255,59,59,0.16)",
    borderColor: "rgba(255,59,59,0.55)",
  },

  bigWord: {
    fontSize: 36,
    textAlign: "center",
    color: "#3FAF6C",
    letterSpacing: 0.2,
  },

  bigWordImposter: {
    color: "#FF5A7A",
  },

  note: {
    color: "rgba(234,242,255,0.72)",
    lineHeight: 20,
    textAlign: "right",
    fontSize: 13,
  },

  progress: {
    color: "rgba(234,242,255,0.70)",
    marginTop: 2,
    textAlign: "right",
    fontSize: 13,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(234,242,255,0.10)",
    marginVertical: 10,
  },

  // Discussion
  discussionHeader: {
    color: "#EAF2FF",
    fontSize: 20,
    textAlign: "right",
    marginBottom: 6,
  },

  discussionCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(234,242,255,0.10)",
    gap: 14,
  },

  sectionTitle: {
    color: "rgba(234,242,255,0.78)",
    fontSize: 13,
    letterSpacing: 0.4,
    textAlign: "right",
    marginTop: 4,
  },

  imposterRevealBox: {
    marginTop: 6,
    marginBottom: 6,
    paddingVertical: 26,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,59,59,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,59,59,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  imposterRevealText: {
    fontSize: 40,
    textAlign: "center",
    color: "#FF5A7A",
    letterSpacing: 0.2,
  },
  modalBackdrop: {
  flex: 1,
  backgroundColor: "rgba(0,0,0)",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
},

modalCard: {
  width: "100%",
  borderRadius: 22,
  padding: 18,
  backgroundColor: "rgba(255,255,255,0.06)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
  gap: 12,
},

modalTitle: {
  color: "#FFFFFF",
  fontSize: 18,
  textAlign: "right",
},

modalText: {
  color: "rgba(255,255,255,0.75)",
  fontSize: 14,
  lineHeight: 20,
  textAlign: "right",
},

modalRow: {
  flexDirection: "row-reverse",
  gap: 10,
  marginTop: 6,
},

});


