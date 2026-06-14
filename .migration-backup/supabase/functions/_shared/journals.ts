// Shared whitelist of approved medical journals/sources for AI.
// AI is instructed to only cite from this list.
export const APPROVED_JOURNALS = [
  "The New England Journal of Medicine (NEJM) — https://www.nejm.org",
  "The Lancet — https://www.thelancet.com",
  "JAMA — https://jamanetwork.com/journals/jama",
  "BMJ — https://www.bmj.com",
  "Nature Medicine — https://www.nature.com/nm",
  "Annals of Internal Medicine — https://www.acpjournals.org/journal/aim",
  "Cell — https://www.cell.com",
  "Science Translational Medicine — https://www.science.org/journal/stm",
  "PLOS Medicine — https://journals.plos.org/plosmedicine",
  "Cochrane Database of Systematic Reviews — https://www.cochranelibrary.com",
  "Mayo Clinic Proceedings — https://www.mayoclinicproceedings.org",
  "CMAJ — https://www.cmaj.ca",
  "PubMed Central — https://www.ncbi.nlm.nih.gov/pmc",
  "Circulation — https://www.ahajournals.org/journal/circ",
  "JACC — https://www.jacc.org",
  "European Heart Journal — https://academic.oup.com/eurheartj",
  "Heart (BMJ) — https://heart.bmj.com",
  "JAMA Cardiology — https://jamanetwork.com/journals/jamacardiology",
  "American Journal of Cardiology — https://www.ajconline.org",
  "JAMA Neurology — https://jamanetwork.com/journals/jamaneurology",
  "Neurology (AAN) — https://www.neurology.org",
  "Brain — https://academic.oup.com/brain",
  "Lancet Neurology — https://www.thelancet.com/journals/laneur",
  "Annals of Neurology — https://onlinelibrary.wiley.com/journal/15318249",
  "Stroke — https://www.ahajournals.org/journal/str",
  "Lancet Oncology — https://www.thelancet.com/journals/lanonc",
  "Journal of Clinical Oncology — https://ascopubs.org/journal/jco",
  "JAMA Oncology — https://jamanetwork.com/journals/jamaoncology",
  "Cancer Cell — https://www.cell.com/cancer-cell",
  "Nature Reviews Cancer — https://www.nature.com/nrc",
  "CA: A Cancer Journal for Clinicians — https://acsjournals.onlinelibrary.wiley.com/journal/15424863",
  "Diabetes Care — https://diabetesjournals.org/care",
  "Diabetes (ADA) — https://diabetesjournals.org/diabetes",
  "Lancet Diabetes Endocrinology — https://www.thelancet.com/journals/landia",
  "JCEM — https://academic.oup.com/jcem",
  "Endocrine Reviews — https://academic.oup.com/edrv",
  "Gastroenterology — https://www.gastrojournal.org",
  "Gut (BMJ) — https://gut.bmj.com",
  "Hepatology — https://aasldpubs.onlinelibrary.wiley.com/journal/15273350",
  "American Journal of Gastroenterology — https://journals.lww.com/ajg",
  "Lancet Gastro Hep — https://www.thelancet.com/journals/langas",
  "AJRCCM — https://www.atsjournals.org/journal/ajrccm",
  "Chest — https://journal.chestnet.org",
  "Lancet Respiratory Medicine — https://www.thelancet.com/journals/lanres",
  "European Respiratory Journal — https://erj.ersjournals.com",
  "Thorax (BMJ) — https://thorax.bmj.com",
  "Lancet Infectious Diseases — https://www.thelancet.com/journals/laninf",
  "Clinical Infectious Diseases — https://academic.oup.com/cid",
  "Journal of Infectious Diseases — https://academic.oup.com/jid",
  "Emerging Infectious Diseases (CDC) — https://wwwnc.cdc.gov/eid",
  "AIDS — https://journals.lww.com/aidsonline",
  "Pediatrics (AAP) — https://publications.aap.org/pediatrics",
  "JAMA Pediatrics — https://jamanetwork.com/journals/jamapediatrics",
  "Lancet Child Adolescent Health — https://www.thelancet.com/journals/lanchi",
  "Archives of Disease in Childhood — https://adc.bmj.com",
  "Journal of Pediatrics — https://www.jpeds.com",
  "Obstetrics and Gynecology — https://journals.lww.com/greenjournal",
  "AJOG — https://www.ajog.org",
  "Human Reproduction — https://academic.oup.com/humrep",
  "Lancet Psychiatry — https://www.thelancet.com/journals/lanpsy",
  "JAMA Psychiatry — https://jamanetwork.com/journals/jamapsychiatry",
  "American Journal of Psychiatry — https://ajp.psychiatryonline.org",
  "British Journal of Psychiatry — https://www.cambridge.org/core/journals/the-british-journal-of-psychiatry",
  "Molecular Psychiatry — https://www.nature.com/mp",
  "JAMA Dermatology — https://jamanetwork.com/journals/jamadermatology",
  "JAAD — https://www.jaad.org",
  "British Journal of Dermatology — https://onlinelibrary.wiley.com/journal/13652133",
  "JAMA Ophthalmology — https://jamanetwork.com/journals/jamaophthalmology",
  "Ophthalmology — https://www.aaojournal.org",
  "Kidney International — https://www.kidney-international.org",
  "JASN — https://jasn.asnjournals.org",
  "Lancet Rheumatology — https://www.thelancet.com/journals/lanrhe",
  "Annals of the Rheumatic Diseases — https://ard.bmj.com",
  "Arthritis Rheumatology — https://onlinelibrary.wiley.com/journal/23265205",
  "Blood (ASH) — https://ashpublications.org/blood",
  "Lancet Haematology — https://www.thelancet.com/journals/lanhae",
  "Annals of Surgery — https://journals.lww.com/annalsofsurgery",
  "JAMA Surgery — https://jamanetwork.com/journals/jamasurgery",
  "British Journal of Surgery — https://academic.oup.com/bjs",
  "Anesthesiology — https://pubs.asahq.org/anesthesiology",
  "British Journal of Anaesthesia — https://www.bjanaesthesia.org",
  "Critical Care Medicine — https://journals.lww.com/ccmjournal",
  "Intensive Care Medicine — https://link.springer.com/journal/134",
  "Annals of Emergency Medicine — https://www.annemergmed.com",
  "Academic Emergency Medicine — https://onlinelibrary.wiley.com/journal/15532712",
  "AJPH — https://ajph.aphapublications.org",
  "Lancet Public Health — https://www.thelancet.com/journals/lanpub",
  "WHO Bulletin — https://www.who.int/publications/journals/bulletin",
  "Lancet Global Health — https://www.thelancet.com/journals/langlo",
  "NICE Guidelines — https://www.nice.org.uk/guidance",
  "CDC MMWR — https://www.cdc.gov/mmwr",
  "USPSTF — https://www.uspreventiveservicestaskforce.org",
  "JBJS — https://journals.lww.com/jbjsjournal",
  "Bone Joint Journal — https://boneandjoint.org.uk",
  "Journal of Urology — https://www.auajournals.org/journal/juro",
  "European Urology — https://www.europeanurology.com",
  "JACI — https://www.jacionline.org",
  "Allergy — https://onlinelibrary.wiley.com/journal/13989995",
  "Headache — https://onlinelibrary.wiley.com/journal/15264610",
  "Pain — https://journals.lww.com/pain",
  "Sleep — https://academic.oup.com/sleep",
  "Nutrition Reviews — https://academic.oup.com/nutritionreviews",
  "American Journal of Clinical Nutrition — https://academic.oup.com/ajcn",
];

export const JOURNALS_INSTRUCTION = `EVIDENCE SOURCE WHITELIST (STRICT):
You MUST cite ONLY from this approved whitelist of 100 peer-reviewed medical journals and clinical guidelines. Do NOT cite Wikipedia, blogs, news sites, or any source not on this list.
${APPROVED_JOURNALS.map((j, i) => `${i + 1}. ${j}`).join("\n")}

Format every citation as: "Author et al., Journal Name, Year. URL"
If you cannot find a real source from this whitelist, omit the citation rather than fabricating one.`;

// Sanitize AI text output: remove em-dashes, en-dashes, and emoji.
export function sanitizeText(s: string): string {
  if (!s) return "";
  return s
    .replace(/[\u2014\u2013]/g, ", ") // em/en dash → comma
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}\u{1F600}-\u{1F64F}\u{1F900}-\u{1F9FF}]/gu, "")
    .trim();
}

// Log user actions to user_actions table for admin visibility.
// Best-effort; never throws.
export async function logUserAction(
  supabase: any,
  req: Request,
  functionName: string,
  actionData: Record<string, unknown> = {}
): Promise<void> {
  try {
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userEmail: string | null = null;
    let userName: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data } = await supabase.auth.getUser(token);
      if (data?.user) {
        userId = data.user.id;
        userEmail = data.user.email ?? null;
        userName = data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? null;
      }
    }
    await supabase.from("user_actions").insert({
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
      function_name: functionName,
      action_data: actionData,
    });
  } catch (e) {
    console.warn("logUserAction failed:", e);
  }
}
