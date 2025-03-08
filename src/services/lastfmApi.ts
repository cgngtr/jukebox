/**
 * Generate a detailed biography for an artist based on their genres
 * @param artistName Artist name
 * @param genres Array of genres
 * @param followers Number of followers
 * @returns A generated biography
 */
export const generateFallbackBio = (
  artistName: string,
  genres: string[] = [],
  followers: number = 0
): string => {
  // Get primary genre for more specific bio content
  const primaryGenre = genres.length > 0 ? genres[0].toLowerCase() : '';
  
  // Format followers count
  const followersText = followers > 0
    ? `with a following of ${followers.toLocaleString()} listeners`
    : 'with a dedicated fanbase';
    
  // Generate genre-specific introduction paragraph
  let introduction = '';
  
  if (primaryGenre.includes('pop')) {
    introduction = `${artistName} has established themselves as a powerhouse in the pop music landscape ${followersText}. With chart-topping hits and memorable performances, they've captivated audiences worldwide through infectious melodies and relatable lyrics.`;
  } 
  else if (primaryGenre.includes('rock')) {
    introduction = `${artistName} stands as an influential force in the rock scene ${followersText}. Known for their powerful guitar riffs and commanding presence, they've helped define the sound of modern rock while paying homage to the genre's rich history.`;
  } 
  else if (primaryGenre.includes('hip hop') || primaryGenre.includes('rap')) {
    introduction = `${artistName} has risen to prominence in the hip-hop world ${followersText}. Their distinctive flow and authentic storytelling have earned them respect throughout the industry, with lyrics that reflect personal experiences and cultural commentary.`;
  } 
  else if (primaryGenre.includes('r&b') || primaryGenre.includes('soul')) {
    introduction = `${artistName} brings depth and emotion to the R&B landscape ${followersText}. Their soulful vocals and heartfelt compositions explore themes of love, relationships, and personal growth, creating an intimate connection with listeners.`;
  } 
  else if (primaryGenre.includes('electronic') || primaryGenre.includes('dance')) {
    introduction = `${artistName} is at the forefront of electronic music innovation ${followersText}. Their production prowess and unique sound design have influenced the dance music scene, creating immersive sonic experiences that transcend conventional boundaries.`;
  } 
  else if (primaryGenre.includes('country')) {
    introduction = `${artistName} embodies the authentic spirit of country music ${followersText}. Their storytelling ability and rootsy sound honor the tradition of the genre while bringing fresh perspectives to timeless themes of life, love, and the human experience.`;
  } 
  else if (primaryGenre.includes('jazz')) {
    introduction = `${artistName} demonstrates exceptional musicianship in the jazz world ${followersText}. Their improvisational skill and musical sophistication have earned critical acclaim, continuing the legacy of innovation that defines the genre.`;
  } 
  else if (primaryGenre.includes('classical')) {
    introduction = `${artistName} brings technical mastery and emotional depth to classical music ${followersText}. Their interpretations of both canonical works and contemporary compositions showcase a profound understanding of the classical tradition.`;
  } 
  else if (primaryGenre.includes('folk') || primaryGenre.includes('acoustic')) {
    introduction = `${artistName} crafts intimate and authentic folk music ${followersText}. Their stripped-down arrangements and poetic lyrics create a sense of timelessness, connecting listeners to the rich storytelling tradition of folk music.`;
  } 
  else if (primaryGenre.includes('metal') || primaryGenre.includes('heavy')) {
    introduction = `${artistName} commands attention in the metal scene ${followersText}. Their technical proficiency and intense delivery have earned them a devoted following among fans who appreciate the power and complexity of their music.`;
  } 
  else if (primaryGenre.includes('indie')) {
    introduction = `${artistName} brings a distinctive voice to the indie music landscape ${followersText}. Their authentic approach and artistic integrity have resonated with listeners seeking music that defies mainstream conventions.`;
  } 
  else {
    introduction = `${artistName} is an established artist ${followersText}. Their distinctive sound and artistic vision have made a significant impact on the contemporary music scene.`;
  }
  
  // Generate genre list text
  const genreText = genres.length > 0 
    ? `Their music incorporates elements of ${genres.join(', ')}, creating a sound that is both distinctive and evolving with each release.` 
    : 'They are known for their unique musical style that defies easy categorization.';
  
  // Generate artist impact paragraph
  const impact = `Throughout their career, ${artistName} has consistently pushed boundaries and challenged expectations. ${genreText} Fans and critics alike have recognized their contribution to music, celebrating their artistic growth and authentic expression.`;
  
  // Generate career highlights
  const careerHighlights = `${artistName}'s discography showcases their artistic evolution, from early works that established their signature sound to more recent releases that demonstrate their continued relevance. Concert performances are known for creating memorable connections with audiences, translating the emotional power of their studio recordings into electrifying live experiences.`;
  
  // Generate conclusion
  const conclusion = `As ${artistName} continues to evolve as an artist, their influence extends beyond their music to inspire both contemporaries and emerging talents. Their work stands as a testament to artistic integrity and creative vision in an ever-changing musical landscape.`;
  
  // Combine all sections into complete biography
  return `${introduction}\n\n${impact}\n\n${careerHighlights}\n\n${conclusion}`;
}; 