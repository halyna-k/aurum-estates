export type Property = {
  img: string;
  alt: string;
  tag: string;
  area: string;
  price: string;
  period: string;
  address: string;
  beds: number;
  baths: number;
  size: number | string;
};

export const PROPERTIES: Property[] = [
  {
    tag: "Available Now",
    price: "£6,500", period: "/month",
    address: "14 Brook Street, Mayfair, W1K",
    area: "MAYFAIR · W1K",
    beds: 3, baths: 2, size: "1,450",
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=75",
    alt: "Luxury apartment living room",
  },
  {
    tag: "Available Now",
    price: "£3,200", period: "/month",
    address: "7 Cadogan Place, Chelsea, SW3",
    area: "CHELSEA · SW3",
    beds: 2, baths: 1, size: "820",
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=75",
    alt: "Modern townhouse exterior",
  },
  {
    tag: "Available Now",
    price: "£2,100", period: "/month",
    address: "23 Bethnal Green Road, E1",
    area: "SHOREDITCH · E1",
    beds: 1, baths: 1, size: "550",
    img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=75",
    alt: "Contemporary studio apartment",
  },
];
