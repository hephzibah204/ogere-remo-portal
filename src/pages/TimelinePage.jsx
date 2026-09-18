import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';
import TimelineFeed from '../components/TimelineFeed';

export default function TimelinePage() {
  return (
    <div>
      <SEO
        title="Civic Timeline — What's on your mind?"
        description="Share status updates, photos, stories, and connect with Ogere Remo citizens, indigenes, and diaspora in real-time."
      />
      <Hero
        ey="Civic Social Feed"
        ti="Ogere Civic Timeline"
        sub="Share what's on your mind, attach photos, follow fellow citizens, connect with friends, and direct message in our royal community network."
        dark
      />
      <AdireDivider />

      <Section bg="#0c1322" py="3rem">
        <TimelineFeed />
      </Section>
    </div>
  );
}
