import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import {ArrowUpRight, Clock, Layers} from "lucide-react";
import {useNavigate, useOutletContext} from "react-router";
import Upload from "../../components/Upload";



export function meta({}: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Home() {
    const {isSignedIn, signUp} = useOutletContext<AuthContext>();
    const navigate = useNavigate();
    const handleUploadComplete = (base64: string) => {
        const newId = Date.now().toString();
        navigate(`/visualizer/${newId}`);
        return true;
    };

    return (
        <div className="home">
            <Navbar />

            <section className="hero">
                <div className="announce">
                    <div className="dot">
                        <div className="pulse"></div>
                    </div>
                    <p>Introducing Roomify 2.0</p>
                </div>
                <h1>Build beautiful spaces at the speed of thought with Roomify</h1>
                <p className="subtitle">
                    Roomify is an AI-first design environment that helps you visualize, render, and ship architectural projects faster than ever.
                </p>

                <div id="upload" className="upload-shell">
                    <div className="grid-overlay"></div>

                    <div className="upload-card">
                        <div className="upload-head">
                            <div className="upload-icon">
                                <Layers className="icon" />
                            </div>
                            <h3>Upload your floor plans</h3>
                            <p>Supports JPG, PNG, formats up to 10MB</p>
                        </div>
                        <p>{isSignedIn ? "Upload images" : "Sign up to upload"}</p>
                        <Upload onComplete={handleUploadComplete}/>
                    </div>

                </div>
            </section>

            <section className="projects">
                <div className="section-inner">
                    <div className="section-head">
                        <div className="copy">
                            <h2>Projects</h2>
                            <p>Your latest work and shared community projects, all in one place.</p>
                        </div>
                    </div>
                    <div className="projects-grid">
                        <div className="project-card group">
                            <div className="preview">
                                <img src="https://roomify-mlhuk267-dfwu1i.puter.site/projects/1770803585402/rendered.png"
                                     alt="Project Preview"/>
                                <div className="badge">
                                    <span>Community</span>
                                </div>
                            </div>
                            <div className="card-body">
                                <div>
                                    <h3>Project Manhatan</h3>
                                    <div className="meta">
                                        <Clock size={12}/>
                                        <span>{new Date('01.01.2027').toLocaleDateString()}</span>
                                        <span>By WYNE</span>
                                    </div>
                                </div>
                                <div className="arrow">
                                    <ArrowUpRight size={18}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
