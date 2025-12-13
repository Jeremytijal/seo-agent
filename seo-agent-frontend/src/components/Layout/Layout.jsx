import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import OnboardingTour from '../OnboardingTour/OnboardingTour';
import './Layout.css';

const Layout = () => {
    const location = useLocation();
    const [showTour, setShowTour] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Show tour only on first visit to dashboard
        const tourCompleted = localStorage.getItem('seoagent_tour_completed');
        if (!tourCompleted && location.pathname === '/') {
            // Small delay to let the page render
            setTimeout(() => setShowTour(true), 500);
        }
    }, [location.pathname]);

    useEffect(() => {
        // Close mobile menu when route changes
        setMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className="app-layout">
            {/* Mobile Menu Button */}
            <button 
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
            >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="mobile-menu-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <div 
                        className="mobile-sidebar-wrapper"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
                    </div>
                </div>
            )}

            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
            {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}
        </div>
    );
};

export default Layout;
