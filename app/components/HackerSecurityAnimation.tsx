import React, { useEffect, useState, useRef } from 'react';
import { Shield, UserX, Lock} from 'lucide-react';

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
  result: 'breach' | 'holding' | 'secure' | 'ultimate' | 'unknown';
}

interface PasswordRequirements {
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  hasMinLength: boolean;
  hasRecommendedLength: boolean;
}

const HackerSecurityAnimation = ({ 
  timeToCrack, 
  strengthReview, 
  passwordRequirements 
}: { 
  timeToCrack: string, 
  strengthReview: string,
  passwordRequirements?: PasswordRequirements 
}) => {
  const [hackers, setHackers] = useState<Hacker[]>([]);
  const [defenseLevel, setDefenseLevel] = useState(1);
  const [shieldCount, setShieldCount] = useState(1);
  const [glowIntensity, setGlowIntensity] = useState(1);
  const animationFrameRef = useRef<number | null>(null);
  const hackerCountRef = useRef<number>(0);
  const fortressLinePosition = 70;

  // Calculate how many requirements are met
  const getRequirementsMet = () => {
    if (!passwordRequirements) return 0;
    
    let count = 0;
    if (passwordRequirements.hasUppercase) count++;
    if (passwordRequirements.hasLowercase) count++;
    if (passwordRequirements.hasNumber) count++;
    if (passwordRequirements.hasSpecial) count++;
    if (passwordRequirements.hasMinLength) count++;
    if (passwordRequirements.hasRecommendedLength) count++;
    
    return count;
  };

  // Get the actual strength level, considering both time and requirements
  const getStrengthLevel = () => {
    const requirementsMet = getRequirementsMet();
    
    // If all 6 requirements are met, it's the ultimate level
    if (requirementsMet === 6) {
      return 'Ultimate';
    }
    
    return timeToCrack;
  };

  // Add the glow effect animation
  useEffect(() => {
    let interval;
    if (defenseLevel > 3) {
      interval = setInterval(() => {
        setGlowIntensity(prev => {
          const newValue = prev + 0.1 * (Math.random() > 0.5 ? 1 : -1);
          return Math.max(0.8, Math.min(1.2, newValue));
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [defenseLevel]);

  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    hackerCountRef.current = 0;
    
    const createInitialHackers = () => {
      const generatedHackers: Hacker[] = [];
      const strengthLevel = getStrengthLevel();
      
      const count = strengthLevel === 'Ultimate' ? 4 :
                   timeToCrack === 'Instantly' ? 15 :
                   timeToCrack === 'Seconds' ? 14 :
                   timeToCrack === 'Weeks' ? 12 :
                   timeToCrack === '10,000+ years' ? 10 :
                   timeToCrack === '3+ billion years' ? 8 :
                   timeToCrack === 'Trillions+ years' ? 6 : 12;
      
      // Create initial hackers that all start from the left side with spacing
      for (let i = 0; i < count; i++) {
        const position = -5 - (i * 5); // Stagger them on the left side
        generatedHackers.push({
          id: hackerCountRef.current++,
          position,
          lane: 10 + Math.random() * 80,
          defeated: false,
          scale: 1.0,
          speed: (0.2 + Math.random() * 0.3) * (
            strengthLevel === 'Ultimate' ? 0.2 :
            timeToCrack === 'Instantly' ? 1.3 :
            timeToCrack === 'Seconds' ? 1.1 :
            timeToCrack === 'Weeks' ? 0.9 :
            timeToCrack === '10,000+ years' ? 0.7 :
            timeToCrack === '3+ billion years' ? 0.5 :
            timeToCrack === 'Trillions+ years' ? 0.3 : 0.8
          )
        });
      }
      return generatedHackers;
    };
    
    const strengthLevel = getStrengthLevel();
    
    switch(strengthLevel) {
      case 'Ultimate':
        setHackers(createInitialHackers());
        setDefenseLevel(7);
        setShieldCount(6);
        break;
      case 'Instantly':
        setHackers(createInitialHackers());
        setDefenseLevel(1);
        setShieldCount(1);
        break;
      case 'Seconds':
        setHackers(createInitialHackers());
        setDefenseLevel(2);
        setShieldCount(1);
        break;
      case 'Weeks':
        setHackers(createInitialHackers());
        setDefenseLevel(3);
        setShieldCount(2);
        break;
      case '10,000+ years':
        setHackers(createInitialHackers());
        setDefenseLevel(4);
        setShieldCount(3);
        break;
      case '3+ billion years':
        setHackers(createInitialHackers());
        setDefenseLevel(5);
        setShieldCount(4);
        break;
      case 'Trillions+ years':
        setHackers(createInitialHackers());
        setDefenseLevel(6);
        setShieldCount(5);
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
          const strengthLevel = getStrengthLevel();
          const shouldAddNew = Math.random() < (strengthLevel === 'Ultimate' ? 0.01 : 0.05);
          const newHackers = shouldAddNew ? [{
            id: hackerCountRef.current++,
            position: -10, // Always start new hackers from left side
            lane: 10 + Math.random() * 80,
            defeated: false,
            scale: 1.0,
            speed: (0.2 + Math.random() * 0.3) * (
              strengthLevel === 'Ultimate' ? 0.2 :
              timeToCrack === 'Instantly' ? 1.3 :
              timeToCrack === 'Seconds' ? 1.1 :
              timeToCrack === 'Weeks' ? 0.9 :
              timeToCrack === '10,000+ years' ? 0.7 :
              timeToCrack === '3+ billion years' ? 0.5 :
              timeToCrack === 'Trillions+ years' ? 0.3 : 0.8
            )
          }] : [];
          
          // Fixed penetration rates according to requirements
          const survivalRate = 
            strengthLevel === 'Ultimate' ? 0.0 :    // 0% penetration
            timeToCrack === 'Instantly' ? 1.0 :     // 100% penetration (Very weak)
            timeToCrack === 'Seconds' ? 0.8 :       // 80% penetration (Weak)  
            timeToCrack === 'Weeks' ? 0.6 :         // 60% penetration (Fair)
            timeToCrack === '10,000+ years' ? 0.3 : // 30% penetration (Strong)
            timeToCrack === '3+ billion years' ? 0.1 : // 10% penetration (Very strong)
            timeToCrack === 'Trillions+ years' ? 0.1 : // 10% penetration (Very strong) 
            0.5;
          
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
                // For Ultimate strength, 0% should penetrate (all are defeated)
                if (strengthLevel === 'Ultimate') {
                  isDefeated = true;
                  blinkProgress = 1;
                } else {
                  // For other strength levels, use the survival rate
                  isDefeated = Math.random() > survivalRate;
                  if (isDefeated) {
                    blinkProgress = 1;
                  }
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
  }, [timeToCrack, passwordRequirements]);

  const getStrengthStyles = (): StrengthStyles => {
    const strengthLevel = getStrengthLevel();
    
    switch(strengthLevel) {
      case 'Ultimate':
        return {
          fortressColor: 'bg-purple-500/30 border-purple-500/50',
          textColor: 'text-purple-400',
          message: 'Fortress Impenetrable',
          result: 'ultimate'
        };
      case 'Instantly':
        return {
          fortressColor: 'bg-red-600/20 border-red-600/30',
          textColor: 'text-red-500',
          message: 'Fortress breached!',
          result: 'breach'
        };
      case 'Seconds':
        return {
          fortressColor: 'bg-red-500/20 border-red-500/30',
          textColor: 'text-red-400',
          message: 'Very weak defenses',
          result: 'breach'
        };
      case 'Weeks':
        return {
          fortressColor: 'bg-orange-500/20 border-orange-500/30',
          textColor: 'text-orange-400',
          message: 'Basic protection',
          result: 'holding'
        };
      case '10,000+ years':
        return {
          fortressColor: 'bg-yellow-400/20 border-yellow-400/30',
          textColor: 'text-yellow-400',
          message: 'Strong fortress',
          result: 'secure'
        };
      case '3+ billion years':
        return {
          fortressColor: 'bg-green-500/20 border-green-500/30',
          textColor: 'text-green-500',
          message: 'Impenetrable fortress',
          result: 'secure'
        };
      case 'Trillions+ years':
        return {
          fortressColor: 'bg-emerald-400/20 border-emerald-400/30',
          textColor: 'text-emerald-400',
          message: 'Quantum-resistant fortress',
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
  const strengthLevel = getStrengthLevel();

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <h3 className={`text-sm font-medium ${styles.textColor}`}>
          {strengthLevel === 'Ultimate' ? (
            <span>ULTIMATE SECURITY<span className="ml-2">💎</span></span>
          ) : (
            <span>Time to crack: <span className="font-bold">{timeToCrack}</span></span>
          )}
        </h3>
        <span className={`text-xs ${
          styles.result === 'ultimate' ? 'text-purple-400' :
          styles.result === 'breach' ? 'text-red-400' : 
          styles.result === 'holding' ? 'text-orange-400' : 
          styles.result === 'secure' ? 'text-green-400' : 
          'text-slate-400'
        }`}>
          {styles.result === 'ultimate' ? 'Fortress Impenetrable' :
           styles.result === 'breach' ? 'High Risk' : 
           styles.result === 'holding' ? 'Medium Risk' : 
           styles.result === 'secure' ? 'Secure' : 
           'Unknown'}
        </span>
      </div>
      
      <div className="relative h-12 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 mb-1">
        <div 
          className={`absolute right-0 top-0 bottom-0 w-3/10 ${styles.fortressColor} flex items-center justify-center transition-all duration-500`}
          style={{ 
            width: '30%',
            boxShadow: defenseLevel > 2 ? 
              `-1px 0 ${5 * glowIntensity}px ${
                defenseLevel === 7 ? `rgba(168, 85, 247, ${0.4 * glowIntensity})` :
                defenseLevel > 4 ? `rgba(34, 197, 94, ${0.3 * glowIntensity})` : 
                `rgba(250, 204, 21, ${0.3 * glowIntensity})`
              }` : 'none' 
          }}
        >
          <div className="flex flex-row justify-center items-center h-full">
            {Array(shieldCount).fill(0).map((_, i) => (
              <div key={i} className="relative mx-1">
                {i === 5 && defenseLevel >= 7 ? (
                  <Lock 
                    size={16}
                    className="text-purple-400"
                    style={{
                      filter: defenseLevel >= 7 ? `drop-shadow(0 0 ${3 * glowIntensity}px rgba(168, 85, 247, ${0.5 * glowIntensity}))` : 'none'
                    }}
                  />
                ) : (
                  <Shield 
                    size={16}
                    className={`${
                      styles.result === 'ultimate' ? 'text-purple-400' :
                      styles.result === 'breach' ? 'text-red-500 opacity-50' : 
                      styles.result === 'holding' ? 'text-orange-400' : 
                      defenseLevel >= 6 && i === 4 ? 'text-emerald-400' :
                      'text-green-500'
                    }`} 
                    style={{
                      filter: defenseLevel > 3 ? 
                        `drop-shadow(0 0 ${2 * glowIntensity}px ${
                          styles.result === 'ultimate' ? `rgba(168, 85, 247, ${0.5 * glowIntensity})` :
                          styles.result === 'breach' ? 'none' : 
                          styles.result === 'holding' ? `rgba(251, 146, 60, ${0.4 * glowIntensity})` : 
                          defenseLevel >= 6 ? `rgba(52, 211, 153, ${0.5 * glowIntensity})` :
                          `rgba(34, 197, 94, ${0.4 * glowIntensity})`
                        })` : 'none'
                    }}
                  />
                )}
              </div>
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
                    ? `drop-shadow(0 0 ${2 * glowIntensity}px rgba(0, 255, 255, ${0.7 * glowIntensity}))`
                    : (!hacker.defeated ? `drop-shadow(0 0 ${1 * glowIntensity}px rgba(0, 200, 255, ${0.5 * glowIntensity}))` : 'none')
                }}
              />
              
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-start">
        <span className={`text-xs italic ${styles.textColor}`}>Review: {strengthReview}</span>
      </div>
    </div>
  );
};

export default HackerSecurityAnimation;