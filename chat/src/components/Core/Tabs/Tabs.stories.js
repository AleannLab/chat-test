import React from 'react';
import Tabs from '.';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import AssessmentIcon from '@material-ui/icons/Assessment';
import SettingsIcon from '@material-ui/icons/Settings';

export default {
  title: 'Tabs',
  component: Tabs,
};

export const Main = (args) => {
  return <Tabs {...args} />;
};

// Default arg values
Main.args = {
  config: [
    {
      index: 0,
      label: 'Tab 1',
      body: <div>Tab 1 - Body</div>,
    },
    {
      index: 1,
      label: 'Tab 2',
      body: <div>Tab 2 - Body</div>,
    },
    {
      index: 2,
      label: 'Tab 3',
      body: <div>Tab 3 - Body</div>,
    },
  ],
  defaultTabIndex: 0,
};

export const TitleWithIcons = () => {
  const tabs = [
    {
      index: 0,
      label: (
        <div>
          <AccountBoxIcon /> Profile
        </div>
      ),
      body: <div>User profile details</div>,
    },
    {
      index: 1,
      label: (
        <div>
          <AssessmentIcon /> Statistics
        </div>
      ),
      body: <div>User statistics</div>,
    },
    {
      index: 2,
      label: (
        <div>
          <SettingsIcon /> Settings
        </div>
      ),
      body: <div>User settings</div>,
    },
  ];

  return <Tabs config={tabs} defaultTabIndex={tabs[0].index} />;
};

export const ScrollableTabs = () => {
  const tabs = [
    {
      index: 0,
      label: 'Iron Man',
      body: (
        <div style={{ display: 'flex' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/en/4/47/Iron_Man_%28circa_2018%29.png"
            alt="Iron Man"
          />
          <div style={{ padding: '0rem 1rem' }}>
            Iron Man is a fictional superhero appearing in American comic books
            published by Marvel Comics. The character was co-created by writer
            and editor Stan Lee, developed by scripter Larry Lieber, and
            designed by artists Don Heck and Jack Kirby.
          </div>
        </div>
      ),
    },
    {
      index: 1,
      label: 'Thanos',
      body: (
        <div style={{ display: 'flex' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/en/c/cd/Thanos_Infinity_4.png"
            alt="Thanos"
          />
          <div style={{ padding: '0rem 1rem' }}>
            Thanos is a fictional supervillain appearing in American comic books
            published by Marvel Comics. He was created by writer-artist Jim
            Starlin, and made his first appearance in The Invincible Iron Man
            #55. An alien warlord from the moon Titan, Thanos is regarded as one
            of the most powerful beings in the Marvel Universe.
          </div>
        </div>
      ),
    },
    {
      index: 2,
      label: 'Spider-Man',
      body: (
        <div style={{ display: 'flex' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/en/2/21/Web_of_Spider-Man_Vol_1_129-1.png"
            alt="Spider-Man"
          />
          <div style={{ padding: '0rem 1rem' }}>
            Spider-Man is a fictional superhero created by writer-editor Stan
            Lee and writer-artist Steve Ditko. He first appeared in the
            anthology comic book Amazing Fantasy #15 in the Silver Age of Comic
            Books.
          </div>
        </div>
      ),
    },
    {
      index: 3,
      label: 'Captain America',
      body: (
        <div style={{ display: 'flex' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/en/9/91/CaptainAmerica109.jpg"
            alt="Captain America"
          />
          <div style={{ padding: '0rem 1rem' }}>
            Captain America is a superhero appearing in American comic books
            published by Marvel Comics. Created by cartoonists Joe Simon and
            Jack Kirby, the character first appeared in Captain America Comics
            #1 from Timely Comics, a predecessor of Marvel Comics.
          </div>
        </div>
      ),
    },
    {
      index: 4,
      label: 'Wanda Maximoff',
      body: (
        <div style={{ display: 'flex' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/en/9/97/Scarlet_Witch.jpg"
            alt="Wanda Maximoff"
          />
          <div style={{ padding: '0rem 1rem' }}>
            The Scarlet Witch is a fictional character appearing in American
            comic books published by Marvel Comics. The character was created by
            writer Stan Lee and artist Jack Kirby. Her first appearance was in
            The X-Men #4 in the Silver Age of Comic Books.
          </div>
        </div>
      ),
    },
    {
      index: 5,
      label: 'Thor',
      body: (
        <div style={{ display: 'flex' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/en/4/41/Thor-272.jpg"
            alt="Thor"
          />
          <div style={{ padding: '0rem 1rem' }}>
            Thor Odinson is a fictional superhero appearing in American comic
            books published by Marvel Comics. The character, which is based on
            the Norse deity of the same name, is the Asgardian god of thunder
            who possesses the enchanted hammer, Mjolnir, which grants him the
            ability to fly and manipulate weather amongst his other superhuman
            attributes.
          </div>
        </div>
      ),
    },
    {
      index: 6,
      label: 'Hulk',
      body: (
        <div style={{ display: 'flex' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/en/a/aa/Hulk_%28circa_2019%29.png"
            alt="Hulk"
          />
          <div style={{ padding: '0rem 1rem' }}>
            The Hulk is a fictional superhero appearing in publications by the
            American publisher Marvel Comics. Created by writer Stan Lee and
            artist Jack Kirby, the character first appeared in the debut issue
            of The Incredible Hulk.
          </div>
        </div>
      ),
    },
    {
      index: 7,
      label: 'Doctor Strange',
      body: (
        <div style={{ display: 'flex' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/en/4/4f/Doctor_Strange_Vol_4_2_Ross_Variant_Textless.jpg"
            alt="Wanda Maximoff"
          />
          <div style={{ padding: '0rem 1rem' }}>
            Doctor Stephen Strange is a fictional character appearing in
            American comic books published by Marvel Comics. Created by Steve
            Ditko,[5] the character first appeared in Strange Tales #110
            (cover-dated July 1963). Doctor Strange serves as the Sorcerer
            Supreme, the primary protector of Earth against magical and mystical
            threats. Inspired by stories of black magic and Chandu the Magician,
            Strange was created during the Silver Age of Comic Books to bring a
            different kind of character and themes of mysticism to Marvel
            Comics.
          </div>
        </div>
      ),
    },
  ];

  return <Tabs config={tabs} defaultTabIndex={tabs[0].index} />;
};
