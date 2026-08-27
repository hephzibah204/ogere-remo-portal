import React from "react";
import Hero from "./components/Hero";
import AdireDivider from "./components/AdireDivider";
import SuggestionBox from "./components/SuggestionBox";
import DailyPhrase from "./components/DailyPhrase";

// Basic configuration for Puck
export const config = {
  components: {
    Hero: {
      fields: {
        ey: { type: "text", label: "Eyebrow Text" },
        ti: { type: "text", label: "Title" },
        sub: { type: "textarea", label: "Subtext" },
        dark: { type: "radio", options: [
            { label: "Dark", value: true },
            { label: "Normal", value: false },
        ]},
      },
      defaultProps: {
        ey: "Ancient Town of Ogun State",
        ti: "Welcome to Ogere Remo",
        sub: "A community rich in heritage, culture, and tradition.",
        dark: true,
      },
      render: ({ ey, ti, sub, dark }) => (
        <Hero ey={ey} ti={ti} sub={sub} dark={dark} />
      ),
    },
    AdireDivider: {
        render: () => <AdireDivider />
    },
    SuggestionBox: {
        render: () => (
            <div style={{ maxWidth: "800px", margin: "40px auto" }}>
                <SuggestionBox />
            </div>
        )
    },
    DailyPhrase: {
        render: () => (
            <div style={{ padding: "40px 0" }}>
                <DailyPhrase />
            </div>
        )
    },
    Heading: {
        fields: {
            title: { type: "text" },
            level: {
                type: "select",
                options: [
                    { label: "Heading 1", value: "h1" },
                    { label: "Heading 2", value: "h2" },
                    { label: "Heading 3", value: "h3" },
                ]
            }
        },
        defaultProps: {
            title: "Heading",
            level: "h2"
        },
        render: ({ title, level }) => {
            const Tag = level;
            return (
                <div style={{ padding: "20px 0", maxWidth: "1100px", margin: "0 auto" }}>
                    <Tag style={{ 
                        color: "#C9963A", 
                        fontFamily: "'Cinzel', serif",
                        fontSize: level === "h1" ? "2.5rem" : level === "h2" ? "2rem" : "1.5rem"
                    }}>{title}</Tag>
                </div>
            );
        }
    },
    Text: {
      fields: {
        content: { type: "textarea" },
      },
      defaultProps: {
        content: "Enter your text here...",
      },
      render: ({ content }) => (
        <div style={{ 
          padding: "20px 0", 
          maxWidth: "1100px", 
          margin: "0 auto",
          color: "rgba(245,237,216,.9)",
          lineHeight: 1.8,
          fontSize: "1rem"
        }}>
          {content}
        </div>
      ),
    },
    VerticalSpace: {
        fields: {
            size: {
                type: "select",
                options: [
                    { label: "Small", value: "20px" },
                    { label: "Medium", value: "40px" },
                    { label: "Large", value: "80px" },
                ]
            }
        },
        defaultProps: {
            size: "40px"
        },
        render: ({ size }) => <div style={{ height: size }} />
    },
    Columns: {
      fields: {
        columns: {
          type: "array",
          arrayFields: {
            content: { type: "textarea" },
          },
        },
      },
      defaultProps: {
        columns: [
          { content: "Column 1 content" },
          { content: "Column 2 content" },
        ],
      },
      render: ({ columns }) => (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", 
          gap: "20px",
          padding: "20px 0",
          maxWidth: "1100px",
          margin: "0 auto"
        }}>
          {columns.map((col, i) => (
            <div key={i} style={{ color: "rgba(245,237,216,.8)", lineHeight: 1.6 }}>
              {col.content}
            </div>
          ))}
        </div>
      ),
    },
  },
};
