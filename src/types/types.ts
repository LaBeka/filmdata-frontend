export interface UserResponseDto {
    id: number;
    userName: string;
    fullName: string;
    email: string;
    currentlyActive: boolean;
    age: number;
    roles: string[];
}

export interface FilmResponseDto {
    id: number;
    releaseYear: string; // LocalDate translates to "YYYY-MM-DD" string
    title: string;
    genre: Genre[];      // Matches List<Genre>
    cast: Actor[];       // Matches List<Actor>
    ageRestriction: number;
    awards: Award[];     // Matches List<Award>
    languages: Language[]; // Matches List<Language>
    aspectRatio: number; // double translates to number
    color: string;
    camera: Camera;      // Matches your Camera object
}

// Define the supporting types based on your Java Classes
export interface Genre { id: number; name: string; }
export interface Actor { id: number; name: string; age: number;}
export interface Award { id: number; year: number; name: string; category: string; }
export interface Language { id: number; name: string; }
export interface Camera { id: number; manufacturer: string ; model: string;  }

export interface FilmReviewResponseDto {
    filmId : number;
    reviews : Array<ReviewResponseDto>;
}

export interface ReviewResponseDto {
    index : number;
    userName : string;
    email : string;
    text : string;
    date : string;
    score : number;
}