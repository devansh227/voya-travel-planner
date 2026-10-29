/**
 * Curated photograph manifest, keyed by the backend's stable `place_id`.
 *
 * Sourcing & verification
 * - Every file is hosted on Wikimedia Commons, which accepts only freely
 *   licensed or public-domain media. Author and exact licence are shown on
 *   each file's Commons page (linked from the Photo credits page).
 * - Each file was matched to its attraction by its Commons file title as
 *   returned by a Commons search for that attraction. Individual images were
 *   NOT pixel-inspected and file pages could not be opened during curation,
 *   so status is "title-match", not "visually verified".
 * - Where only a related view exists (e.g. one temple of a temple group),
 *   `subject` says exactly what the photo‘≠ shows.
 * - Attractions without an entry get an honest placeholder, never a
 *   look-alike photograph.
 */

export interface AttractionImage {
  /** File name on Commons, without the "File:" prefix. */
  file: string;
  /** What the photograph actually depicts. */
  subject: string;
  status: "title-match";
}

const e = (subject: string, file: string): AttractionImage => ({
  file,
  subject,
  status: "title-match",
});

export const ATTRACTION_IMAGES: Record<string, AttractionImage> = {
  MP0001: e("Rajwada Palace, Indore", "Rajwada Palace, Indore.jpg"),
  MP0002: e("Lal Bagh Palace, Indore", "Lalbagh Palace, Indore.jpg"),
  MP0012: e("Patalpani Waterfall", "Patalpani Waterfalls.jpg"),
  MP0016: e("Mahakaleshwar Temple, Ujjain", "Mahakaleshwar Temple, Ujjain.jpg"),
  MP0017: e("Kal Bhairav Temple, Ujjain", "Kal Bhairav temple Ujjain.jpg"),
  MP0018: e("Ram Ghat, Ujjain", "Ujjain, Ram Ghat (9840921865).jpg"),
  MP0020: e("Samrat Yantra, Ujjain observatory", "Samrat Yantra Jantar Mantar ,Ujjain - panoramio.jpg"),
  MP0025: e("Jahaz Mahal, Mandu", "Jahaz-Mahal at Mandu Fort (5102865251).jpg"),
  MP0026: e("Hindola Mahal, Mandu", "Hindola Mahal, mandu.jpg"),
  MP0027: e("Jami Masjid, Mandu", "Jami Masjid, Mandu 02.jpg"),
  MP0028: e("Tomb of Hoshang Shah, Mandu", "Mandu, Tomb of Hoshang Shah (9840495736).jpg"),
  MP0029: e("Rani Roopmati Pavilion, Mandu", "Rani Rupmati Mahal Mandu front view.jpg"),
  MP0033: e("Dhar Fort", "Dhar Fort, Dhar, Madhya Pradesh 2.jpg"),
  MP0034: e("Bagh Caves", "Bagh Cave 4 and 5, Madhya Pradesh 182.jpg"),
  MP0036: e("Ahilya Fort and ghat, Maheshwar", "Maheshwar Fort-Ahilya Ghat.jpg"),
  MP0038: e("Omkareshwar (Mandhata island)", "Omkareshwar, Shri Omkar Mandhata (9840595185).jpg"),
  MP0039: e("Mamleshwar Temple, Omkareshwar", "0102621 Mamleshwar Temple, Amareshwar mandir, Omkareshwar Madhya Pradesh 201.jpg"),
  MP0043: e("Asirgarh Fort", "Asirgarh Fort1.jpg"),
  MP0044: e("Shahi Qila, Burhanpur", "Shahi Qila, Burhanpur.jpg"),
  MP0055: e("Taj-ul-Masajid, Bhopal", "Taj-ul-Masjid, Bhopal.jpg"),
  MP0056: e("Moti Masjid, Bhopal", "Bhopal, Moti Masjid (9840931024).jpg"),
  MP0057: e("Gohar Mahal, Bhopal", "Gohar Mahal.jpg"),
  MP0058: e("Upper Lake (Bhojtal), Bhopal", "Upper Lake, Bhopal, M.P.jpg"),
  MP0059: e("Van Vihar National Park, Bhopal", "Van Vihar National Park, Bhopal.jpg"),
  MP0062: e("Bharat Bhavan, Bhopal", "Bharat Bhavan Bhopal inside-1.JPG"),
  MP0065: e("Laxmi Narayan (Birla) Temple, Bhopal", "Laxmi Narayan Temple (Birla Temple), Bhopal.JPG"),
  MP0068: e("The Great Stupa, Sanchi", "The Great Stupa at Sanchi in Madhya Pradesh.jpg"),
  MP0069: e("Bhimbetka rock shelters", "Bhimbetka Caves, Madhya Pradesh.jpg"),
  MP0070: e("Bhojeshwar Temple, Bhojpur", "Bhojeshwar Temple, Bhojpur, Madhya Pradesh.jpg"),
  MP0073: e("Udayagiri Caves", "Udaigiri Caves.JPG"),
  MP0074: e("Heliodorus Pillar, Besnagar", "Heliodorus pillarVidsha.JPG"),
  MP0078: e("Pachmarhi", "Pachmarhi.jpg"),
  MP0080: e("Bee Falls, Pachmarhi", "Bee Falls @ Pachmarhi.jpg"),
  MP0081: e("Pandav Caves, Pachmarhi", "Pandav caves, Pachmarhi.jpg"),
  MP0086: e("Chanderi Fort", "Chanderi Fort.jpg"),
  MP0087: e("Koshak Mahal, Chanderi", "Koshak Mahal, Chanderi, Ashok Nagar, Madhya Pradesh, India.JPG"),
  MP0099: e("Gwalior Fort", "Gwalior Fort front.jpg"),
  MP0100: e("Man Singh (Man Mandir) Palace, Gwalior Fort", "0121521 Man Singh Palace, Gwalior Fort Madhya Pradesh 06.jpg"),
  MP0101: e("Sas-Bahu Temple, Gwalior", "Saas-bahu Temple (Gwalior).jpg"),
  MP0102: e("Teli ka Mandir, Gwalior Fort", "Teli Ka Mandir, Gwalior.jpg"),
  MP0103: e("Gopachal rock-cut Jain sculptures, Gwalior", "Gopachal Parvat - Rockcut Jain Sculptures.jpg"),
  MP0104: e("Jai Vilas Palace, Gwalior", "The Jai Vilas Palace (Gwalior).jpg"),
  MP0105: e("Tomb of Tansen, Gwalior", "Tomb of Tansen, Gwalior.JPG"),
  MP0110: e("Chausath Yogini Temple, Mitaoli", "Chausath Yogini Temple, Mitaoli.jpg"),
  MP0111: e("Bateshwar temple group", "Bateshwar Temples (15695822503).jpg"),
  MP0119: e("Bir Singh Palace, Datia", "Magnificent entrance of Bir Singh Palace, Datia, Madhya Pradesh.jpg"),
  MP0121: e("Sonagiri Jain temples", "Sonagiri Jain Temple, MP, India.jpg"),
  MP0122: e("Jahangir Mahal, Orchha Fort complex", "JAHANGIR MAHAL ORCHHA, TIKAMGARH,MADHYA PRADESH.jpg"),
  MP0124: e("Chaturbhuj Temple, Orchha", "Chaturbhuj Temple, Orchha.jpg"),
  MP0125: e("Royal chhatris (cenotaphs), Orchha", "The Royal Chhatris (Cenotaphs) at Orchha.jpg"),
  MP0128: e("Kandariya Mahadeva Temple, Western Group, Khajuraho", "Kandariya Mahadev Temple Front View.jpg"),
  MP0129: e("Kandariya Mahadeva Temple, Khajuraho", "Kandariya Mahadeva Temple, Khajuraho, India 12.jpg"),
  MP0130: e("Lakshmana Temple, Khajuraho", "Khajuraho-Lakshmana temple.JPG"),
  MP0131: e("Parshvanatha Temple, Eastern Group, Khajuraho", "Parshwanath Temple - Khajuraho - 2.jpg"),
  MP0132: e("Chausath Yogini Temple, Khajuraho", "Chausath Yogini temple, Khajuraho.jpg"),
  MP0134: e("Raneh Falls", "Raneh Falls.jpg"),
  MP0135: e("Panna National Park", "Panna national park.jpg"),
  MP0144: e("Dhuandhar Falls, Bhedaghat", "Dhuandhar falls at Bhedaghat, Madhya Pradesh, India.jpg"),
  MP0145: e("Marble Rocks, Bhedaghat", "White Marble Rocks at Bhedaghat.jpg"),
  MP0146: e("Chausath Yogini Temple, Bhedaghat", "Chausath Yogini temple Bhedaghat.jpg"),
  MP0147: e("Madan Mahal Fort, Jabalpur", "MadanMahalFort.JPG"),
  MP0149: e("Balancing Rock, Madan Mahal, Jabalpur", "Balancing Rock Madan Mahal.jpg"),
  MP0153: e("Bengal tiger photographed at Kanha", "Royal Bengal Tiger Kanha.JPG"),
  MP0158: e("Pench National Park", "Pench National Park, Madhya Pradesh - by Ishani Mehta.jpg"),
  MP0163: e("Bandhavgarh National Park", "Bandhavgarh National Park.jpg"),
  MP0165: e("Narmada Kund, Amarkantak", "Narmada Kund, Amarkantak.JPG"),
  MP0166: e("Kapildhara Falls, Amarkantak", "Kapildhara (Kapil waterfall).JPG"),
  MP0170: e("Chachai Falls", "Chachai waterfall.jpg"),
  MP0171: e("Keoti Falls", "Keoti falls in Rewa, Madhya Pradesh.jpg"),
  MP0172: e("Purwa Falls viewpoint", "Purwa waterfall view point.jpg"),
  MP0175: e("Rewa Fort", "White tiger's land Rewa fort.jpg"),
  MP0176: e("Sharada Temple, Maihar", "Sharada Temple Maihar.JPG"),
  MP0177: e("Ram Ghat, Chitrakoot", "Ramghat at chitrakoot.jpg"),
};

/** Commons image URL; Special:FilePath redirects to a resized thumbnail. */
export function commonsImageUrl(file: string, width: number): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    file.replace(/ /g, "_"),
  )}?width=${width}`;
}

/** Commons description page (shows author and licence). */
export function commonsPageUrl(file: string): string {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(
    file.replace(/ /g, "_"),
  )}`;
}

export function getAttractionImage(placeId: string): AttractionImage | undefined {
  return ATTRACTION_IMAGES[placeId];
}

/** Place IDs used for editorial photos on the landing and form pages. */
export const EDITORIAL = {
  hero: "MP0129", // Kandariya Mahadeva Temple, Khajuraho
  form: "MP0125", // Orchha chhatris
  gallery: [
    { id: "MP0099", tag: "Heritage" },
    { id: "MP0025", tag: "Architecture" },
    { id: "MP0068", tag: "Culture" },
    { id: "MP0145", tag: "Nature" },
    { id: "MP0153", tag: "Wildlife" },
  ],
} as const;
