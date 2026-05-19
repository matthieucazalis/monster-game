import "../pages/style/components.css";

interface Decoration {
  user_decoration_id: number;
  name: string;
  image_url: string;
}

interface DecorationShelfProps {
  decorations: Decoration[];
}

export default function DecorationShelf({ decorations }: DecorationShelfProps) {
  const slots = Array.from({ length: 6 }, (_, i) => decorations[i] ?? null);
  const row1 = slots.slice(0, 3);
  const row2 = slots.slice(3, 6);

  const renderSlot = (item: Decoration | null, i: number) => (
    <div className="shelf-slot" key={i}>
      {item ? (
        <img src={item.image_url} alt={item.name} title={item.name} />
      ) : (
        <div className="shelf-slot-empty" />
      )}
    </div>
  );

  return (
    <div className="shelf-wrap">
      <img className="shelf-image" src="/images/counter.png" alt="comptoir" />
      <div className="shelf-top-items">
        {row1.map((item, i) => renderSlot(item, i))}
      </div>
      <div className="shelf-bottom-items">
        {row2.map((item, i) => renderSlot(item, i))}
      </div>
    </div>
  );
}
