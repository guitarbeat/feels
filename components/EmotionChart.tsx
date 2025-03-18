import { useRef, useEffect } from 'react';
import { EmotionPoint, standardEmotions } from '../lib/emotion-model';
import * as d3 from 'd3';
import styles from '../styles/EmotionChart.module.css';

interface EmotionChartProps {
  history?: EmotionPoint[];
  currentEmotion?: EmotionPoint | null;
  width?: number;
  height?: number;
}

export function EmotionChart({ 
  history = [], 
  currentEmotion = null, 
  width = 600, 
  height = 600 
}: EmotionChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([-1, 1])
      .range([0, innerWidth]);
      
    const yScale = d3.scaleLinear()
      .domain([-1, 1])
      .range([innerHeight, 0]); // Flip y-axis
    
    // Quadrant backgrounds
    svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', innerWidth/2)
      .attr('height', innerHeight/2)
      .attr('fill', '#ffcccc')
      .attr('opacity', 0.3);
      
    svg.append('rect')
      .attr('x', 0)
      .attr('y', innerHeight/2)
      .attr('width', innerWidth/2)
      .attr('height', innerHeight/2)
      .attr('fill', '#ccccff')
      .attr('opacity', 0.3);
      
    svg.append('rect')
      .attr('x', innerWidth/2)
      .attr('y', 0)
      .attr('width', innerWidth/2)
      .attr('height', innerHeight/2)
      .attr('fill', '#ffffcc')
      .attr('opacity', 0.3);
      
    svg.append('rect')
      .attr('x', innerWidth/2)
      .attr('y', innerHeight/2)
      .attr('width', innerWidth/2)
      .attr('height', innerHeight/2)
      .attr('fill', '#ccffcc')
      .attr('opacity', 0.3);

    // Add axis
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    
    svg.append('g')
      .attr('transform', `translate(0, ${innerHeight/2})`)
      .call(xAxis);
      
    svg.append('g')
      .attr('transform', `translate(${innerWidth/2}, 0)`)
      .call(yAxis);
    
    // Axis labels
    svg.append('text')
      .attr('x', innerWidth)
      .attr('y', innerHeight/2 + 30)
      .attr('text-anchor', 'end')
      .text('Positive');
      
    svg.append('text')
      .attr('x', 0)
      .attr('y', innerHeight/2 + 30)
      .attr('text-anchor', 'start')
      .text('Negative');
      
    svg.append('text')
      .attr('x', innerWidth/2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .text('High Energy');
      
    svg.append('text')
      .attr('x', innerWidth/2)
      .attr('y', innerHeight - 10)
      .attr('text-anchor', 'middle')
      .text('Low Energy');
    
    // Draw standard emotions
    Object.values(standardEmotions).forEach(emotion => {
      svg.append('circle')
        .attr('cx', xScale(emotion.valence))
        .attr('cy', yScale(emotion.arousal))
        .attr('r', 5)
        .attr('fill', 'gray')
        .attr('opacity', 0.5);
        
      svg.append('text')
        .attr('x', xScale(emotion.valence) + 7)
        .attr('y', yScale(emotion.arousal))
        .attr('font-size', '10px')
        .text(emotion.label);
    });
    
    // Draw history path
    if (history.length > 1) {
      const line = d3.line<EmotionPoint>()
        .x(d => xScale(d.valence))
        .y(d => yScale(d.arousal))
        .curve(d3.curveMonotoneX);
      
      svg.append('path')
        .attr('d', line(history))
        .attr('stroke', 'purple')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('opacity', 0.7);
    }
    
    // Plot history points
    history.forEach((emotion, i) => {
      if (i === history.length - 1 && currentEmotion) return; // Skip last if current is provided
      
      svg.append('circle')
        .attr('cx', xScale(emotion.valence))
        .attr('cy', yScale(emotion.arousal))
        .attr('r', 4)
        .attr('fill', 'blue')
        .attr('opacity', 0.6);
    });
    
    // Draw current emotion
    if (currentEmotion) {
      svg.append('circle')
        .attr('cx', xScale(currentEmotion.valence))
        .attr('cy', yScale(currentEmotion.arousal))
        .attr('r', 8)
        .attr('fill', 'red')
        .attr('stroke', 'black');
        
      svg.append('text')
        .attr('x', xScale(currentEmotion.valence) + 10)
        .attr('y', yScale(currentEmotion.arousal))
        .attr('font-weight', 'bold')
        .text(currentEmotion.label || 'Current');
    }
    
  }, [history, currentEmotion, width, height]);

  return (
    <div className={styles.chartWrapper}>
      <svg ref={svgRef}></svg>
    </div>
  );
}
