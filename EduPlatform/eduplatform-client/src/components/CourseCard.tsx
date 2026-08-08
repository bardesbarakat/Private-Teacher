import { Link } from 'react-router-dom';
import { BookOpen, Users, Clock, Award } from 'lucide-react';

interface CourseCardProps {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  level: string;
  isFree: boolean;
  price: number;
  lessonsCount: number;
  enrollmentsCount: number;
  features: string[];
}

const CourseCard = ({ id, title, shortDescription, category, level, isFree, price, lessonsCount, enrollmentsCount, features }: CourseCardProps) => {
  const getCategoryColor = () => {
    switch(category) {
      case 'programming': return 'var(--mint)';
      case 'ai': return 'var(--violet)';
      case 'web': return 'var(--amber)';
      default: return 'var(--mint)';
    }
  };

  const catColor = getCategoryColor();

  return (
    <div className="card course-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.3s' }}>
      <div style={{ position: 'relative', height: '160px', background: 'var(--bg-2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: `radial-gradient(circle, ${catColor}20 0%, transparent 60%)`, opacity: 0.5 }}></div>
        <BookOpen size={48} color={catColor} style={{ opacity: 0.8 }} />
        
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
          <span className="badge" style={{ background: `${catColor}20`, color: catColor }}>
            {level}
          </span>
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', lineHeight: '1.4' }}>{title}</h3>
        <p style={{ color: 'var(--text-soft)', fontSize: '14px', marginBottom: '20px', flex: 1 }}>{shortDescription}</p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', color: 'var(--text-dim)', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {lessonsCount} درس</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> {enrollmentsCount} طالب</div>
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {features.slice(0, 3).map((feat, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-soft)' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: catColor }}></div>
              {feat}
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: '20px', marginTop: 'auto' }}>
          <div>
            {isFree ? (
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--mint)' }}>مجاني</span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text)' }}>{price}</span>
                <span style={{ fontSize: '14px', color: 'var(--text-soft)' }}>ج.م</span>
              </div>
            )}
          </div>
          <Link to={`/courses/${id}`} className="btn" style={{ background: `${catColor}20`, color: catColor, padding: '8px 16px' }}>
            التفاصيل
          </Link>
        </div>
      </div>
      
      <style>{`
        .course-card:hover {
          transform: translateY(-8px);
          border-color: var(--mint-line);
          box-shadow: var(--shadow-mint);
        }
      `}</style>
    </div>
  );
};

export default CourseCard;
