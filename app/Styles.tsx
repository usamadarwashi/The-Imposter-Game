import { StyleSheet } from "react-native";

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
    minHeight: 48,
    paddingTop: 12,
    paddingBottom: 12,
  },

  list: { gap: 10, marginBottom: 70 },

  listItem: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(234,242,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    padding: 5,
    marginBottom: 5
  },

  listText: {
    color: "#EAF2FF",
    fontSize: 16,
    textAlign: "right",
    flex: 1, 
    marginHorizontal: 8, 
  },

  gbtn: {
    borderRadius: 14,
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

  card: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(234,242,255,0.10)",
    gap: 12,
  },

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
  marginTop: 30,
},
dragHandle: {
  width: 36,
  height: 36,
  alignItems: "center",
  justifyContent: "center",
},

stickyBottomBar: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  paddingBottom: 50,
  paddingHorizontal: 16,
  paddingTop: 10,
  borderTopWidth: 1,
  borderTopColor: "rgba(255,255,255,0.08)",
  backgroundColor: "#070B14",

},
setupHeader: {
  paddingHorizontal: 18,
  paddingBottom: 12,
},

});


export default styles;