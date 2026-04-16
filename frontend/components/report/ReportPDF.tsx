"use client";
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { AnalysisResult } from '@/types/resume';

// Register fonts for Vietnamese support and Serif style
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-vietnamese-400-normal.woff' },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-vietnamese-700-normal.woff', fontWeight: 'bold' },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-vietnamese-400-italic.woff', fontStyle: 'italic' },
  ]
});

Font.register({
  family: 'Spectral',
  src: 'https://cdn.jsdelivr.net/npm/@fontsource/spectral/files/spectral-vietnamese-700-normal.woff',
  fontWeight: 'bold',
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#030303',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#262626',
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Spectral',
    fontWeight: 'bold',
    color: '#E1FF01',
  },
  date: {
    fontSize: 9,
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  executiveBox: {
    backgroundColor: '#0A0A0A',
    border: 1,
    borderColor: '#262626',
    padding: 15,
    marginBottom: 20,
  },
  executiveHeader: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#8E8E93',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 2,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 15,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 8,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#8E8E93',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 42,
    fontFamily: 'Spectral',
    fontWeight: 'bold',
    color: '#E1FF01',
  },
  metricSub: {
    fontSize: 8,
    color: '#8E8E93',
    marginTop: 2,
  },
  assessmentBox: {
    borderLeft: 3,
    borderLeftColor: '#E1FF01',
    paddingLeft: 15,
    marginTop: 10,
  },
  assessmentText: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#CCCCCC',
    lineHeight: 1.6,
  },
  grid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  col2: {
    flex: 2.5,
  },
  col1: {
    flex: 1.5,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#E1FF01',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  competencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingBottom: 4,
    borderBottom: 0.5,
    borderBottomColor: '#1A1A1A',
  },
  competencyLabel: {
    fontSize: 9,
    color: '#FFFFFF',
  },
  competencyValue: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#E1FF01',
  },
  progressBarContainer: {
    height: 6,
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 3,
    marginVertical: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E1FF01',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    fontSize: 7,
    padding: '2 4',
    backgroundColor: '#1A1A1A',
    border: 0.5,
    borderColor: '#262626',
    color: '#CCCCCC',
  },
  badgeHit: {
    color: '#E1FF01',
    borderColor: '#E1FF01',
  },
  badgeMiss: {
    color: '#FF453A',
    borderColor: '#FF453A',
  },
  listContainer: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    gap: 10,
  },
  bullet: {
    width: 4,
    height: 4,
    backgroundColor: '#E1FF01',
    marginTop: 4,
  },
  listContent: {
    fontSize: 8.5,
    color: '#CCCCCC',
    lineHeight: 1.4,
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
    borderTop: 0.5,
    borderTopColor: '#262626',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: '#555555',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});

interface ReportPDFProps {
  result: AnalysisResult;
  lang: string;
}

export const ReportPDF = ({ result, lang }: ReportPDFProps) => {
  const isVi = lang === 'vi';
  const matchPercent = Math.round((result.cvKeywords.length / (result.cvKeywords.length + result.missingKeywords.length || 1)) * 100);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Resume Analysis Report</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString(isVi ? 'vi-VN' : 'en-US')}</Text>
        </View>

        {/* Executive Summary Section */}
        <View style={styles.executiveBox}>
          <Text style={styles.executiveHeader}>{isVi ? 'TÓM TẮT BÁO CÁO' : 'EXECUTIVE SUMMARY'}</Text>
          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>{isVi ? 'Đánh giá tổng thể' : 'Overall Match'}</Text>
              <Text style={styles.metricValue}>{result.rate}</Text>
            </View>
            <View style={{ width: 1, height: 40, backgroundColor: '#262626', transform: 'rotate(15deg)' }} />
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>{isVi ? 'Độ khớp ngữ nghĩa' : 'Semantic Match'}</Text>
              <Text style={styles.metricValue}>{result.semanticScore}%</Text>
              <Text style={styles.metricSub}>AI VALIDATED</Text>
            </View>
          </View>
          
          <View style={styles.assessmentBox}>
            <Text style={styles.assessmentText}>"{result.general}"</Text>
          </View>
        </View>

        {/* Row 2: Competency Matrix & Keyword Stats */}
        <View style={styles.grid}>
          <View style={styles.col1}>
            <Text style={styles.sectionTitle}>{isVi ? 'MA TRẬN NĂNG LỰC' : 'COMPETENCY MATRIX'}</Text>
            {result.skillsAnalysis.map((skill, i) => (
              <View key={i} style={styles.competencyItem}>
                <Text style={styles.competencyLabel}>{skill.skill}</Text>
                <Text style={styles.competencyValue}>{Math.round(skill.cv * 10)}%</Text>
              </View>
            ))}
          </View>

          <View style={styles.col2}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text style={styles.sectionTitle}>{isVi ? 'PHÂN TÍCH TỪ KHÓA (ATS)' : 'KEYWORD GAP ANALYSIS'}</Text>
              <Text style={{ fontSize: 10, color: '#E1FF01', fontFamily: 'Inter', fontWeight: 'bold' }}>{matchPercent}%</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${matchPercent}%` }]} />
            </View>

            <View style={styles.badgeContainer}>
              {result.cvKeywords.slice(0, 15).map((kw, i) => (
                <Text key={`hit-${i}`} style={[styles.badge, styles.badgeHit]}>{kw}</Text>
              ))}
              {result.missingKeywords.slice(0, 15).map((kw, i) => (
                <Text key={`miss-${i}`} style={[styles.badge, styles.badgeMiss]}>{kw}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Row 3: Strengths & Weaknesses */}
        <View style={styles.grid}>
          <View style={styles.col1}>
            <Text style={styles.sectionTitle}>{isVi ? 'ĐIỂM MẠNH' : 'STRENGTHS'}</Text>
            <View style={styles.listContainer}>
              {result.strengths.slice(0, 4).map((s, i) => (
                <View key={i} style={styles.listItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.listContent}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.col2}>
            <Text style={[styles.sectionTitle, { color: '#FF453A' }]}>{isVi ? 'ĐIỂM YẾU' : 'WEAKNESSES'}</Text>
            <View style={styles.listContainer}>
              {result.weaknesses.slice(0, 4).map((w, i) => (
                <View key={i} style={styles.listItem}>
                  <View style={[styles.bullet, { backgroundColor: '#FF453A' }]} />
                  <Text style={styles.listContent}>{w}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Strategic Improvements */}
        <View style={{ marginTop: 10 }}>
          <Text style={styles.sectionTitle}>{isVi ? 'CHIẾN LƯỢC CẢI THIỆN' : 'STRATEGIC IMPROVEMENTS'}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
            {result.improvements.slice(0, 4).map((imp, i) => (
              <View key={i} style={{ width: '47%', marginBottom: 6 }}>
                <Text style={{ fontSize: 7, color: '#E1FF01', marginBottom: 2 }}>STRATEGY 0{i+1}</Text>
                <Text style={styles.listContent}>{imp}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>PRODUCED BY RESUME AI ENGINE</Text>
          <Text style={styles.footerText}>INTERNAL DOCUMENT • CONFIDENTIAL</Text>
        </View>
      </Page>
    </Document>
  );
};
