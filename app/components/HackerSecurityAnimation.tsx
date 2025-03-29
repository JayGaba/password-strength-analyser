import React, { useEffect, useState, useRef } from 'react';
import { Shield, UserX } from 'lucide-react';

interface Hacker {
  id: number;
  position: number;
  lane: number;
  defeated: boolean;
  scale: number;
  speed: number;
  blinkProgress?: number;
}

interface StrengthStyles {
  fortressColor: string;
  textColor: string;
  message: string;
  result: 'breach' | 'holding' | 'secure' | 'unknown';
}

const HackerSecurityAnimation = ({ timeToCrack }: { timeToCrack: string }) => {
  const [hackers, setHackers] = useState<Hacker[]>([]);
  const [defenseLevel, setDefenseLevel] = useState(1);
  const [shieldCount, setShieldCount] = useState(1);
  const animationFrameRef = useRef<number | null>(null);
  const hackerCountRef = useRef<number>(0);
  const fortressLinePosition = 70;

  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    hackerCountRef.current = 0;
    
    const createInitialHackers = () => {
      const generatedHackers: Hacker[] = [];
      const count = timeToCrack === 'Instantly' ? 15 :
                   timeToCrack === 'A few hours' ? 12 :
                   timeToCrack === 'A few months' ? 10 :
                   timeToCrack === 'A few years' ? 9 : 8;
      
      for (let i = 0; i < count; i++) {
        const position = -10 + (i * 120 / count);
        generatedHackers.push({
          id: hackerCountRef.current++,
          position,
          lane: 10 + Math.random() * 80,
          defeated: false,
          scale: 1.0,
          speed: (0.2 + Math.random() * 0.3) * (
            timeToCrack === 'Instantly' ? 1.2 :
            timeToCrack === 'A few hours' ? 1.0 :
            timeToCrack === 'A few months' ? 0.8 :
            timeToCrack === 'A few years' ? 0.7 : 0.6
          )
        });
      }
      return generatedHackers;
    };
    
    switch(timeToCrack) {
      case 'Instantly':
        setHackers(createInitialHackers());
        setDefenseLevel(1);
        setShieldCount(1);
        break;
      case 'A few hours':
        setHackers(createInitialHackers());
        setDefenseLevel(2);
        setShieldCount(1);
        break;
      case 'A few months':
        setHackers(createInitialHackers());
        setDefenseLevel(3);
        setShieldCount(2);
        break;
      case 'A few years':
        setHackers(createInitialHackers());
        setDefenseLevel(4);
        setShieldCount(3);
        break;
      case 'Centuries':
        setHackers(createInitialHackers());
        setDefenseLevel(5);
        setShieldCount(4);
        break;
      default:
        setHackers([]);
        setDefenseLevel(1);
        setShieldCount(1);
    }
    
    let lastTime = 0;
    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaTime = time - lastTime;
      
      if (deltaTime > 16) {
        lastTime = time;
        
        setHackers(prevHackers => {
          const shouldAddNew = Math.random() < 0.05;
          const newHackers = shouldAddNew ? [{
            id: hackerCountRef.current++,
            position: -10,
            lane: 10 + Math.random() * 80,
            defeated: false,
            scale: 1.0,
            speed: (0.2 + Math.random() * 0.3) * (
              timeToCrack === 'Instantly' ? 1.2 :
              timeToCrack === 'A few hours' ? 1.0 :
              timeToCrack === 'A few months' ? 0.8 :
              timeToCrack === 'A few years' ? 0.7 : 0.6
            ),
            releases: []
          }] : [];
          
        
          
          const survivalRate = 
            timeToCrack === 'Instantly' ? 1.0 :
            timeToCrack === 'A few hours' ? 0.7 :
            timeToCrack === 'A few months' ? 0.4 :
            timeToCrack === 'A few years' ? 0.2 : 0.0;
          
          const updatedHackers = prevHackers
            .map(hacker => {
              if (hacker.position > 120) {
                return null;
              }
              
              const approachesLine = 
                hacker.position < fortressLinePosition && 
                hacker.position + hacker.speed >= fortressLinePosition;
              
              let isDefeated = hacker.defeated;
              let blinkProgress = hacker.blinkProgress || 0;
              
              if (approachesLine && !isDefeated) {
                isDefeated = Math.random() > survivalRate;
                if (isDefeated) {
                  blinkProgress = 1;
                }
              }
              
              const newPosition = isDefeated ? 
                Math.min(hacker.position, fortressLinePosition) : // Stop at border if defeated
                hacker.position + hacker.speed;
              
              let newScale = hacker.scale;
              if (isDefeated && blinkProgress > 0) {
                newScale = 1.0 + (blinkProgress * 0.3);
                blinkProgress = Math.max(0, blinkProgress - 0.05);
              } else if (newPosition > fortressLinePosition && !isDefeated) {
                newScale = 1.0 + (0.1 * Math.sin(time / 300 + hacker.id * 5));
              }
              
              return {
                ...hacker,
                position: newPosition,
                defeated: isDefeated,
                scale: newScale,
                blinkProgress: blinkProgress
              };
            })
            .filter(Boolean) as Hacker[];
          
          return [...updatedHackers, ...newHackers];
        });
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [timeToCrack]);

  const getStrengthStyles = (): StrengthStyles => {
    switch(timeToCrack) {
      case 'Instantly':
        return {
          fortressColor: 'bg-red-500/20 border-red-500/30',
          textColor: 'text-red-500',
          message: 'Fortress breached!',
          result: 'breach'
        };
      case 'A few hours':
        return {
          fortressColor: 'bg-orange-500/20 border-orange-500/30',
          textColor: 'text-orange-400',
          message: 'Weak defenses',
          result: 'breach'
        };
      case 'A few months':
        return {
          fortressColor: 'bg-yellow-400/20 border-yellow-400/30',
          textColor: 'text-yellow-400',
          message: 'Decent protection',
          result: 'holding'
        };
      case 'A few years':
        return {
          fortressColor: 'bg-teal-500/20 border-teal-500/30',
          textColor: 'text-teal-400',
          message: 'Strong fortress',
          result: 'secure'
        };
      case 'Centuries':
        return {
          fortressColor: 'bg-green-500/20 border-green-500/30',
          textColor: 'text-green-500',
          message: 'Impenetrable fortress',
          result: 'secure'
        };
      default:
        return {
          fortressColor: 'bg-slate-500/20 border-slate-500/30',
          textColor: 'text-slate-400',
          message: 'Not analyzed',
          result: 'unknown'
        };
    }
  };

  const styles = getStrengthStyles();

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <h3 className={`text-sm font-medium ${styles.textColor}`}>Security Fortress</h3>
        <span className="text-xs text-slate-400">
          {styles.result === 'breach' ? 'High Risk' : 
           styles.result === 'holding' ? 'Medium Risk' : 
           styles.result === 'secure' ? 'Secure' : 
           'Unknown'}
        </span>
      </div>
      
      <div className="relative h-12 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 mb-1">
        <div 
          className={`absolute right-0 top-0 bottom-0 w-3/10 ${styles.fortressColor} border-l flex items-center justify-center transition-all duration-500`}
          style={{ 
            width: '30%',
            boxShadow: defenseLevel > 2 ? `-1px 0 5px ${defenseLevel > 4 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(250, 204, 21, 0.3)'}` : 'none' 
          }}
        >
          <div className="flex flex-row justify-center items-center h-full">
            {Array(shieldCount).fill(0).map((_, i) => (
              <Shield 
                key={i} 
                size={16}
                className={`mx-1 ${
                  styles.result === 'breach' ? 'text-red-500 opacity-50' : 
                  styles.result === 'holding' ? 'text-orange-400' : 
                  'text-green-500'
                }`} 
              />
            ))}
          </div>
        </div>
        
        {hackers.map(hacker => (
          <div 
            key={hacker.id}
            style={{ 
              position: 'absolute',
              left: `${hacker.position}%`, 
              top: `${hacker.lane}%`,
              transform: `translateY(-50%) scale(${hacker.scale}) ${hacker.defeated && hacker.blinkProgress === 0 ? 'rotate(90deg)' : ''}`,
              opacity: hacker.defeated ? (hacker.blinkProgress || 0) : 1,
              transition: 'transform 0.3s ease, opacity 0.3s ease',
              zIndex: hacker.defeated ? 0 : 1
            }}
          >
            <div className="relative">
              <UserX 
                size={14} 
                className={`${hacker.defeated ? 'text-red-500' : 'text-slate-300'}`}
                style={{
                  filter: (!hacker.defeated && hacker.position > fortressLinePosition) 
                    ? 'drop-shadow(0 0 2px rgba(0, 255, 255, 0.7))'
                    : (!hacker.defeated ? 'drop-shadow(0 0 1px rgba(0, 200, 255, 0.5))' : 'none')
                }}
              />
              <div 
                className={`absolute top-0 left-1/2 rounded-t-full transform -translate-x-1/2 -translate-y-1 ${
                  hacker.defeated ? 'bg-red-800' : 'bg-slate-800'
                }`}
                style={{ width: '8px', height: '3px' }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-start items-center">
        <span className={`text-xs ${styles.textColor}`}>{styles.message}</span>
      </div>
    </div>
  );
};

export default HackerSecurityAnimation;